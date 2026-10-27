import { MongoServerError, type Collection, type Db, type Document } from 'mongodb';
import { importLocalPlayers } from './import-files';
import type { DetailRow } from './merge';
import {
  groupPlayers,
  nextDetail,
  personaName,
  summaryDocument,
  withDetails,
  type LegacySource,
  type LegacyWriter,
  type PlayerBundle,
  type PlayerStore,
  type SavedPlayer,
  type SourceHead,
  type SourceName,
} from './player-store';

/** One saved source in MongoDB. */
type SourceDoc = {
  /** Owner. Empty when imported files have not been claimed yet. */
  readonly userId: string | null;

  /** Steam account id. */
  readonly accountId: number;

  /** Feed this document belongs to. */
  readonly source: SourceName;

  /** Name taken from the snapshot. Empty when the snapshot had no name. */
  readonly personaName: string | null;

  /** Profile and match list, without parsed matches. */
  readonly summary: Document;

  /** When this snapshot was last written. */
  readonly updatedAt: Date;
};

/** One parsed match in MongoDB. */
type DetailDoc = {
  /** Owner. Empty when imported files have not been claimed yet. */
  readonly userId: string | null;

  /** Steam account id. */
  readonly accountId: number;

  /** Feed this parse belongs to. */
  readonly source: SourceName;

  /** Dota match id. */
  readonly matchId: number;

  /** Stored parse. */
  readonly row: DetailRow;
};

/** Bookkeeping for the file import and the first owner. */
type MetaDoc = {
  /** Which one-time step this row tracks. */
  readonly _id: string;

  /** True when the file import finished. */
  readonly done?: boolean;

  /** Person who received the imported files. */
  readonly userId?: string;

  /** How many sources the import wrote. */
  readonly sources?: number;

  /** When the import last ran. */
  readonly importedAt?: Date;

  /** When the imported files were given to a person. */
  readonly claimedAt?: Date;
};

const DETAIL_CHUNK = 200;

/** Player snapshots stored in MongoDB. */
export class MongoStore implements PlayerStore, LegacyWriter {
  private readonly sources: Collection<SourceDoc>;

  private readonly details: Collection<DetailDoc>;

  private readonly meta: Collection<MetaDoc>;

  public constructor(db: Db) {
    this.sources = db.collection<SourceDoc>('sources');
    this.details = db.collection<DetailDoc>('details');
    this.meta = db.collection<MetaDoc>('meta');
  }

  /** Indexes for one snapshot per person, account, and source. */
  public async ensureIndexes(): Promise<void> {
    await this.sources.createIndex({ userId: 1, accountId: 1, source: 1 }, { unique: true });
    await this.details.createIndex({ userId: 1, accountId: 1, source: 1, matchId: 1 }, { unique: true });
  }

  /** Copies player files into MongoDB once. Returns how many sources were written. */
  public async importLocalFiles(root: string): Promise<number> {
    const existing = await this.meta.findOne({ _id: 'local-files' });
    if (existing?.done) return 0;
    if (!existing) {
      try {
        await this.meta.insertOne({ _id: 'local-files', done: false, importedAt: new Date() });
      } catch (error) {
        if (!isDuplicate(error)) throw error;
        const again = await this.meta.findOne({ _id: 'local-files' });
        if (again?.done) return 0;
      }
    }
    const sources = await importLocalPlayers(root, this);
    await this.meta.updateOne({ _id: 'local-files' }, { $set: { done: true, sources, importedAt: new Date() } });
    return sources;
  }

  /** Gives unowned imported snapshots to this person. Does nothing the second time. */
  public async claimUnowned(userId: string): Promise<void> {
    const previous = await this.meta.findOneAndUpdate(
      { _id: 'legacy-owner' },
      { $setOnInsert: { userId, claimedAt: new Date() } },
      { upsert: true, returnDocument: 'before' },
    );
    if (previous) return;
    try {
      await this.sources.updateMany({ userId: null }, { $set: { userId } });
      await this.details.updateMany({ userId: null }, { $set: { userId } });
    } catch (error) {
      await this.meta.deleteOne({ _id: 'legacy-owner', userId });
      throw error;
    }
  }

  /** Accounts that have a saved snapshot for this person. */
  public async listPlayers(userId: string): Promise<readonly SavedPlayer[]> {
    const rows = await this.sources
      .find({ userId }, { projection: { accountId: 1, source: 1, personaName: 1 } })
      .toArray();
    const heads: SourceHead[] = rows.map((row) => ({
      accountId: row.accountId,
      source: row.source,
      personaName: row.personaName,
    }));
    return groupPlayers(heads);
  }

  /** Saved summary for one source. Empty when nothing has been saved. */
  public async readSummary(userId: string, accountId: number, source: SourceName): Promise<unknown | null> {
    const doc = await this.sources.findOne({ userId, accountId, source }, { projection: { summary: 1 } });
    return doc?.summary ?? null;
  }

  /** Saves the profile and match list for one source. */
  public async writeSummary(
    userId: string,
    accountId: number,
    source: SourceName,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.writeSummaryAt(userId, accountId, source, data);
  }

  /** The three source snapshots for one account, with parsed matches attached. */
  public async readBundle(userId: string, accountId: number): Promise<PlayerBundle> {
    const load = async (source: SourceName) => {
      const [summary, details] = await Promise.all([
        this.readSummary(userId, accountId, source),
        this.readDetails(userId, accountId, source),
      ]);
      return withDetails(summary, details);
    };
    const [opendota, steam, stratz] = await Promise.all([load('opendota'), load('steam'), load('stratz')]);
    return { opendota, steam, stratz };
  }

  /** Stores one match parse. An earlier successful parse stays in place. */
  public async appendDetail(userId: string, accountId: number, source: SourceName, row: DetailRow): Promise<void> {
    const current = await this.details.findOne({ userId, accountId, source, matchId: row.match_id });
    const kept = nextDetail(current?.row ?? null, row);
    await this.details.updateOne(
      { userId, accountId, source, matchId: kept.match_id },
      { $set: { userId, accountId, source, matchId: kept.match_id, row: kept } },
      { upsert: true },
    );
  }

  /** Writes one source taken from the old files. */
  public async importSource(input: LegacySource): Promise<void> {
    await this.writeSummaryAt(input.userId, input.accountId, input.source, input.summary ?? {});
    await this.replaceDetails(input.userId, input.accountId, input.source, input.details);
  }

  private async writeSummaryAt(
    userId: string | null,
    accountId: number,
    source: SourceName,
    data: Record<string, unknown>,
  ): Promise<void> {
    const summary = summaryDocument(data);
    await this.sources.updateOne(
      { userId, accountId, source },
      {
        $set: {
          userId,
          accountId,
          source,
          personaName: personaName(summary),
          summary,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  private async readDetails(userId: string, accountId: number, source: SourceName): Promise<DetailRow[]> {
    const docs = await this.details.find({ userId, accountId, source }, { projection: { row: 1 } }).toArray();
    return docs.map((doc) => doc.row);
  }

  private async replaceDetails(
    userId: string | null,
    accountId: number,
    source: SourceName,
    rows: readonly DetailRow[],
  ): Promise<void> {
    await this.details.deleteMany({ userId, accountId, source });
    for (let index = 0; index < rows.length; index += DETAIL_CHUNK) {
      const chunk = rows.slice(index, index + DETAIL_CHUNK).map((row) => ({
        userId,
        accountId,
        source,
        matchId: row.match_id,
        row,
      }));
      if (chunk.length === 0) continue;
      await this.details.insertMany(chunk);
    }
  }
}

function isDuplicate(error: unknown): boolean {
  return error instanceof MongoServerError && error.code === 11000;
}

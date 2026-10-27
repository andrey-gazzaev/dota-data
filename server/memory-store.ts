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
  type SourceName,
} from './player-store';

type Slot = {
  /** Profile and match list, without parsed matches. */
  readonly summary: Record<string, unknown>;

  /** Name taken from the snapshot. Empty when the snapshot had no name. */
  readonly personaName: string | null;

  /** Parsed matches for this source, keyed by match id. */
  readonly details: Map<number, DetailRow>;
};

/** Player snapshots kept in memory. Used by tests. */
export class MemoryStore implements PlayerStore, LegacyWriter {
  private readonly slots = new Map<string, Slot>();

  private claimed = false;

  /** Accounts that have a saved snapshot for this person. */
  public async listPlayers(userId: string): Promise<readonly SavedPlayer[]> {
    return groupPlayers(
      [...this.slots.entries()].flatMap(([key, slot]) => {
        const head = this.parseKey(key);
        if (!head || head.userId !== userId) return [];
        return [{ accountId: head.accountId, source: head.source, personaName: slot.personaName }];
      }),
    );
  }

  /** Saved summary for one source. Empty when nothing has been saved. */
  public async readSummary(userId: string, accountId: number, source: SourceName): Promise<unknown | null> {
    return this.slots.get(this.key(userId, accountId, source))?.summary ?? null;
  }

  /** Saves the profile and match list for one source. */
  public async writeSummary(
    userId: string,
    accountId: number,
    source: SourceName,
    data: Record<string, unknown>,
  ): Promise<void> {
    this.writeSlot(userId, accountId, source, data);
  }

  /** The three source snapshots for one account, with parsed matches attached. */
  public async readBundle(userId: string, accountId: number): Promise<PlayerBundle> {
    const load = (source: SourceName) => {
      const slot = this.slots.get(this.key(userId, accountId, source));
      return withDetails(slot?.summary ?? null, slot ? [...slot.details.values()] : []);
    };
    return { opendota: load('opendota'), steam: load('steam'), stratz: load('stratz') };
  }

  /** Stores one match parse. An earlier successful parse stays in place. */
  public async appendDetail(userId: string, accountId: number, source: SourceName, row: DetailRow): Promise<void> {
    const slot = this.slots.get(this.key(userId, accountId, source));
    const details = slot?.details ?? new Map<number, DetailRow>();
    const kept = nextDetail(details.get(row.match_id) ?? null, row);
    details.set(kept.match_id, kept);
    this.slots.set(this.key(userId, accountId, source), {
      summary: slot?.summary ?? {},
      personaName: slot?.personaName ?? null,
      details,
    });
  }

  /** Writes one source taken from the old files. */
  public async importSource(input: LegacySource): Promise<void> {
    const summary = summaryDocument(input.summary ?? {});
    this.writeSlot(input.userId, input.accountId, input.source, summary);
    const slot = this.slots.get(this.key(input.userId, input.accountId, input.source));
    if (!slot) return;
    const details = new Map<number, DetailRow>();
    for (const row of input.details) details.set(row.match_id, row);
    this.slots.set(this.key(input.userId, input.accountId, input.source), { ...slot, details });
  }

  /** Gives unowned imported snapshots to this person. Does nothing the second time. */
  public async claimUnowned(userId: string): Promise<void> {
    if (this.claimed) return;
    this.claimed = true;
    for (const [key, slot] of [...this.slots.entries()]) {
      const head = this.parseKey(key);
      if (!head || head.userId !== null) continue;
      this.slots.delete(key);
      this.slots.set(this.key(userId, head.accountId, head.source), slot);
    }
  }

  private writeSlot(userId: string | null, accountId: number, source: SourceName, data: Record<string, unknown>): void {
    const summary = summaryDocument(data);
    const current = this.slots.get(this.key(userId, accountId, source));
    this.slots.set(this.key(userId, accountId, source), {
      summary,
      personaName: personaName(summary),
      details: current?.details ?? new Map(),
    });
  }

  private key(userId: string | null, accountId: number, source: SourceName): string {
    return `${userId ?? ''}:${accountId}:${source}`;
  }

  private parseKey(
    key: string,
  ): { readonly userId: string | null; readonly accountId: number; readonly source: SourceName } | null {
    const [owner, account, source] = key.split(':');
    if (!account || !source || !isKnownSource(source)) return null;
    const accountId = Number(account);
    if (!Number.isSafeInteger(accountId)) return null;
    return { userId: owner ? owner : null, accountId, source };
  }
}

function isKnownSource(value: string): value is SourceName {
  return value === 'opendota' || value === 'steam' || value === 'stratz';
}

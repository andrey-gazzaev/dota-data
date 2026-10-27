import { asRecord } from './json';
import { mergeMatchDetails, type DetailRow } from './merge';

/** OpenDota, then Steam, then STRATZ. */
export const SOURCE_ORDER = ['opendota', 'steam', 'stratz'] as const;

/** OpenDota, Steam, or STRATZ. */
export type SourceName = (typeof SOURCE_ORDER)[number];

/** True when this string is a known source name. */
export function isSourceName(value: string): value is SourceName {
  return (SOURCE_ORDER as readonly string[]).includes(value);
}

/** Name fields copied from one saved source. */
export type SourceHead = {
  /** Steam account id. */
  readonly accountId: number;

  /** Feed this row belongs to. */
  readonly source: SourceName;

  /** Name stored with this source. Empty when the snapshot had no name. */
  readonly personaName: string | null;
};

/** An account that has a saved snapshot. */
export type SavedPlayer = {
  /** Steam account id. */
  readonly accountId: number;

  /** Name shown for this account. A placeholder when no source stored a name. */
  readonly personaName: string;

  /** Sources that have a snapshot, in source order. */
  readonly sources: readonly SourceName[];
};

/** The three source snapshots for one account. */
export type PlayerBundle = {
  /** OpenDota snapshot. Empty when that source was not saved. */
  readonly opendota: unknown | null;

  /** Steam snapshot. Empty when that source was not saved. */
  readonly steam: unknown | null;

  /** STRATZ snapshot. Empty when that source was not saved. */
  readonly stratz: unknown | null;
};

/** One source taken from the old player files. */
export type LegacySource = {
  /** Owner. Empty when the files have not been claimed yet. */
  readonly userId: string | null;

  /** Steam account id. */
  readonly accountId: number;

  /** Which feed this file came from. */
  readonly source: SourceName;

  /** Profile and match list. Empty when only parses were saved. */
  readonly summary: Record<string, unknown> | null;

  /** Parsed matches for this source. */
  readonly details: readonly DetailRow[];
};

/** Saved snapshots for one person. */
export type PlayerStore = {
  /** Accounts that have a saved snapshot for this person. */
  readonly listPlayers: (userId: string) => Promise<readonly SavedPlayer[]>;

  /** Saved summary for one source. Empty when nothing has been saved. */
  readonly readSummary: (userId: string, accountId: number, source: SourceName) => Promise<unknown | null>;

  /** Saves the profile and match list for one source. */
  readonly writeSummary: (
    userId: string,
    accountId: number,
    source: SourceName,
    data: Record<string, unknown>,
  ) => Promise<void>;

  /** The three source snapshots for one account, with parsed matches attached. */
  readonly readBundle: (userId: string, accountId: number) => Promise<PlayerBundle>;

  /** Stores one match parse. An earlier successful parse stays in place. */
  readonly appendDetail: (userId: string, accountId: number, source: SourceName, row: DetailRow) => Promise<void>;
};

/** Writes sources that were read from the old files. */
export type LegacyWriter = {
  /** Writes one source taken from the old files. */
  readonly importSource: (input: LegacySource) => Promise<void>;
};

/** Persona name stored inside a source snapshot. Empty when none of the feeds had one. */
export function personaName(data: unknown): string | null {
  const root = asRecord(data);
  const openInner = asRecord(asRecord(root?.profile)?.profile);
  const steam = asRecord(root?.profile);
  const stratz = asRecord(asRecord(root?.profile)?.steamAccount);
  const name = openInner?.personaname ?? steam?.personaname ?? stratz?.name;
  return typeof name === 'string' && name.length > 0 ? name : null;
}

/** Summary document without the parsed-match list. */
export function summaryDocument(data: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...data };
  delete rest.match_details;
  return rest;
}

/** Match parse stored as one document. */
export function storedDetail(row: DetailRow): DetailRow {
  return {
    match_id: row.match_id,
    ...('data' in row ? { data: row.data } : {}),
    ...(typeof row.error === 'string' ? { error: row.error } : {}),
  };
}

/** Parse kept after one more row is added. The first successful parse wins. */
export function nextDetail(existing: DetailRow | null, row: DetailRow): DetailRow {
  const [kept] = mergeMatchDetails(existing ? [existing] : [], [storedDetail(row)]);
  return kept ?? storedDetail(row);
}

/** Snapshot plus its parsed matches. Empty when both parts are missing. */
export function withDetails(summary: unknown | null, details: readonly DetailRow[]): unknown | null {
  const base = asRecord(summary);
  if (!base && details.length === 0) return null;
  return { ...(base ?? {}), match_details: [...details] };
}

/** One list row per account, ordered by the shown name. */
export function groupPlayers(rows: readonly SourceHead[]): SavedPlayer[] {
  const byAccount = new Map<number, Map<SourceName, string | null>>();
  for (const row of rows) {
    const sources = byAccount.get(row.accountId) ?? new Map<SourceName, string | null>();
    sources.set(row.source, row.personaName);
    byAccount.set(row.accountId, sources);
  }

  return [...byAccount.entries()]
    .map(([accountId, sources]) => {
      const ordered = SOURCE_ORDER.filter((source) => sources.has(source));
      const name = ordered.map((source) => sources.get(source)).find((value) => value);
      return { accountId, personaName: name ?? `Игрок ${accountId}`, sources: ordered };
    })
    .sort((left, right) => left.personaName.localeCompare(right.personaName, 'ru'));
}

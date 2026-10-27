import { asArray, asNumber, asRecord } from './json';

/** One stored match parse. */
export type DetailRow = {
  /** Dota match id. */
  readonly match_id: number;

  /** Parsed match payload. Absent when the parse was not stored. */
  readonly data?: unknown;

  /** Why the parse failed. Absent when it succeeded. */
  readonly error?: string;
};

/** True when this parse did not succeed. */
export function detailFailed(row: { readonly error?: unknown; readonly data?: unknown }): boolean {
  if (typeof row.error === 'string' && row.error.length > 0) return true;
  const data = asRecord(row.data);
  if (!data) return true;
  if (data.error) return true;
  if (!Array.isArray(data.players) || data.players.length === 0) return true;
  return false;
}

/** Stored parses, or an empty list. */
export function asDetailRows(value: unknown): DetailRow[] {
  return asArray(value).flatMap((item) => {
    const row = asRecord(item);
    const matchId = asNumber(row?.match_id);
    if (!row || matchId == null) return [];
    const detail: DetailRow = {
      match_id: matchId,
      ...('data' in row ? { data: row.data } : {}),
      ...(typeof row.error === 'string' ? { error: row.error } : {}),
    };
    return [detail];
  });
}

/** Stored parses, with a newer parse replacing the same match. */
export function mergeMatchDetails(existing: DetailRow[], incoming: DetailRow[]): DetailRow[] {
  const good = new Map<number, DetailRow>();
  const bad = new Map<number, DetailRow>();
  const consider = (row: DetailRow, replaceBad: boolean) => {
    if (!detailFailed(row)) {
      if (!good.has(row.match_id)) good.set(row.match_id, row);
      bad.delete(row.match_id);
      return;
    }
    if (good.has(row.match_id)) return;
    if (replaceBad || !bad.has(row.match_id)) bad.set(row.match_id, row);
  };
  for (const row of existing) consider(row, false);
  for (const row of incoming) consider(row, true);
  return [...good.values(), ...[...bad.values()].filter((row) => !good.has(row.match_id))];
}

/** Rows combined so a newer row replaces the same id. */
export function mergeById(existing: unknown[], incoming: unknown[], idOf: (row: unknown) => number | null): unknown[] {
  const merged = new Map<number, unknown>();
  for (const row of existing) {
    const id = idOf(row);
    if (id != null) merged.set(id, row);
  }
  for (const row of incoming) {
    const id = idOf(row);
    if (id != null) merged.set(id, row);
  }
  return [...merged.values()];
}

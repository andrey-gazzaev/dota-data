import { asArray, asNumber, asRecord } from './json';

/** How many recent matches a summary keeps. */
export const RECENT_MATCH_LIMIT = 40;

/** A short match row for lists. */
export type MatchSummaryJson = {
  /** Dota match id. */
  readonly matchId: number;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. */
  readonly duration: number;

  /** Player's hero id. */
  readonly heroId: number;
};

/** Recent OpenDota matches, newest first. These rows have no items or wards. */
export function listOpenDotaSummaries(raw: unknown): MatchSummaryJson[] {
  const root = asRecord(raw);
  if (!root) return [];
  const matches: MatchSummaryJson[] = [];
  for (const item of asArray(root.matches)) {
    const row = asRecord(item);
    const matchId = asNumber(row?.match_id);
    if (!row || matchId == null) continue;
    matches.push({
      matchId,
      startTime: asNumber(row.start_time) ?? 0,
      duration: asNumber(row.duration) ?? 0,
      heroId: asNumber(row.hero_id) ?? 0,
    });
  }
  matches.sort((left, right) => right.startTime - left.startTime || right.matchId - left.matchId);
  return matches;
}

/** Match ids already saved in a summary. */
export function knownMatchIds(bundle: {
  readonly opendota: unknown;
  readonly steam: unknown;
  readonly stratz: unknown;
}): Set<number> {
  const ids = new Set<number>();
  const add = (raw: unknown, key: 'match_id' | 'id') => {
    const root = asRecord(raw);
    for (const item of asArray(root?.matches)) {
      const id = asNumber(asRecord(item)?.[key]);
      if (id != null) ids.add(id);
    }
  };
  add(bundle.opendota, 'match_id');
  add(bundle.steam, 'match_id');
  add(bundle.stratz, 'id');
  return ids;
}

import type { MatchPerformance } from '@/models';

/** How many recent matches a detailed parse covers. */
export const RECENT_MATCH_LIMIT = 40;

/** True when the match has a lineup. */
export function hasMatchDetail(row: MatchPerformance): boolean {
  return row.enemyHeroIds.length > 0 || row.enemies.length > 0 || row.allies.length > 0;
}

/** Newest matches, optionally limited to one hero. */
export function recentPerformances(
  rows: readonly MatchPerformance[],
  heroId: number | null,
  limit = RECENT_MATCH_LIMIT,
): readonly MatchPerformance[] {
  const filtered = heroId == null ? rows : rows.filter((row) => row.heroId === heroId);

  return [...filtered]
    .sort((left, right) => right.startTime - left.startTime || right.matchId - left.matchId)
    .slice(0, limit);
}

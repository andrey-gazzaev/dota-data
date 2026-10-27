import type { HeroStat, MatchPerformance } from '@/models';

/** Games, wins, and last played time for each hero in these matches. */
export function heroStatsFromPerformances(rows: MatchPerformance[]): HeroStat[] {
  const stats = new Map<number, HeroStat>();
  for (const row of rows) {
    const current = stats.get(row.heroId);
    const lastPlayed = Math.max(current?.lastPlayed ?? 0, row.startTime);
    stats.set(row.heroId, {
      heroId: row.heroId,
      games: (current?.games ?? 0) + 1,
      wins: (current?.wins ?? 0) + (row.win ? 1 : 0),
      lastPlayed: lastPlayed > 0 ? lastPlayed : null,
    });
  }

  return [...stats.values()].sort((left, right) => right.games - left.games || left.heroId - right.heroId);
}

/** Hero totals, preferring the primary source and filling gaps from the fallback. */
export function mergeHeroStats(primary: readonly HeroStat[], fallback: readonly HeroStat[]): HeroStat[] {
  const stats = new Map<number, HeroStat>();
  for (const row of fallback) stats.set(row.heroId, { ...row });

  for (const row of primary) {
    const previous = stats.get(row.heroId);
    const lastPlayed = Math.max(row.lastPlayed ?? 0, previous?.lastPlayed ?? 0);
    stats.set(row.heroId, { ...row, lastPlayed: lastPlayed > 0 ? lastPlayed : null });
  }

  return [...stats.values()].sort((left, right) => right.games - left.games || left.heroId - right.heroId);
}

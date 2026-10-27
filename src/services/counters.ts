import type { CounterStat, MatchPerformance } from '@/models';
import { winRate } from './performances';

/** Win rate against each enemy hero. Heroes below the game minimum are left out. */
export function aggregateCounters(rows: readonly MatchPerformance[], heroId: number, minGames = 2): CounterStat[] {
  const counts = new Map<number, CounterStat>();
  for (const row of rows) {
    if (row.heroId !== heroId) continue;
    const enemies = new Set(row.enemyHeroIds.filter((enemy) => enemy > 0));
    for (const enemy of enemies) {
      const current = counts.get(enemy);
      counts.set(enemy, {
        heroId: enemy,
        games: (current?.games ?? 0) + 1,
        wins: (current?.wins ?? 0) + (row.win ? 1 : 0),
      });
    }
  }

  return [...counts.values()]
    .filter((stat) => stat.games >= minGames)
    .sort((left, right) => compareMatchups(left, right, 'asc'));
}

/** Win rate with each allied hero. Heroes below the game minimum are left out. */
export function aggregateSynergy(rows: readonly MatchPerformance[], heroId: number, minGames = 2): CounterStat[] {
  const counts = new Map<number, CounterStat>();
  for (const row of rows) {
    if (row.heroId !== heroId) continue;
    const allies = new Set(row.allies.map((ally) => ally.heroId).filter((id) => id > 0));
    for (const ally of allies) {
      const current = counts.get(ally);
      counts.set(ally, {
        heroId: ally,
        games: (current?.games ?? 0) + 1,
        wins: (current?.wins ?? 0) + (row.win ? 1 : 0),
      });
    }
  }

  return [...counts.values()]
    .filter((stat) => stat.games >= minGames)
    .sort((left, right) => compareMatchups(left, right, 'desc'));
}

/** Best or worst matchups that reach the game minimum. */
export function pickMatchups(
  rows: readonly CounterStat[],
  order: 'asc' | 'desc',
  minGames: number,
  limit: number,
): CounterStat[] {
  return rows
    .filter((stat) => stat.games >= minGames)
    .sort((left, right) => compareMatchups(left, right, order))
    .slice(0, limit);
}

function compareMatchups(left: CounterStat, right: CounterStat, order: 'asc' | 'desc'): number {
  const leftRate = winRate(left.wins, left.games) ?? 0;
  const rightRate = winRate(right.wins, right.games) ?? 0;
  const byRate = order === 'asc' ? leftRate - rightRate : rightRate - leftRate;
  return byRate || right.games - left.games || left.heroId - right.heroId;
}

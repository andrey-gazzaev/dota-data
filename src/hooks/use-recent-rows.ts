import { useMemo } from 'react';
import type { MatchPerformance } from '@/models';
import { hasMatchDetail, recentPerformances } from '@/services';
import type { RecentHeroVm, RecentMatchRowVm, RecentSourceVm } from '@/view-models';
import { buildRecentRow } from './build-recent-row';
import { useDraftTables } from './use-draft-tables';

const EMPTY_ROWS: readonly MatchPerformance[] = [];
const EMPTY_HEROES: readonly RecentHeroVm[] = [];

/** Recent matches ready to show, and the ids that still need a lineup. */
export function useRecentRows(heroId: number | null, source: RecentSourceVm) {
  const rows = source.rows ?? EMPTY_ROWS;
  const stored = useMemo(() => recentPerformances(rows, heroId), [rows, heroId]);
  const score = useDraftTables('all');

  const matches = useMemo((): readonly RecentMatchRowVm[] => {
    const heroes = source.heroMap ?? new Map();
    const items = source.itemMap ?? new Map();

    return stored.map((row) => buildRecentRow(row, heroes, items, score.pending, score.odds));
  }, [stored, source.heroMap, source.itemMap, score.pending, score.odds]);

  const listed = source.heroes ?? EMPTY_HEROES;
  const heroes = useMemo(
    () =>
      [...listed]
        .sort((left, right) => right.games - left.games || left.name.localeCompare(right.name, 'ru'))
        .map((hero) => ({ id: hero.heroId, name: hero.name, games: hero.games })),
    [listed],
  );
  const missing = stored.flatMap((row) => (hasMatchDetail(row) ? [] : [row.matchId]));

  return { isLoading: source.isLoading, heroes, matches, missing };
}

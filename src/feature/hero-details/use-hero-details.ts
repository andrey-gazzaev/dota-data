import { useMemo } from 'react';
import { usePlayerDataContext } from '@/context';
import { useHeroMatchups } from '@/queries';
import { formatWinRate } from '@/services';
import { buildHeroDetails, buildHeroMeta } from './build-hero-details';

/** Builds, counters, and item rates for one hero. */
export function useHeroDetails(heroId: number) {
  const player = usePlayerDataContext();
  const matchups = useHeroMatchups(heroId);
  const view = player.view;
  const heroMap = view?.heroMap;
  const itemMap = view?.itemMap;
  const heroes = view?.heroes;
  const rows = view?.rows;

  const built = useMemo(
    () => buildHeroDetails(heroId, heroMap, itemMap, heroes, rows),
    [heroId, heroMap, itemMap, heroes, rows],
  );
  const meta = useMemo(() => buildHeroMeta(matchups.data, heroMap), [matchups.data, heroMap]);

  return {
    isLoading: player.isLoading,
    isStatsLoading: player.isStatsLoading,
    error: player.error,
    heroName: built?.info?.localizedName ?? (built ? `Герой ${heroId}` : null),
    heroImage: built?.info?.image ?? '',
    games: built?.fromList?.games ?? 0,
    wins: built?.fromList?.wins ?? 0,
    rate: formatWinRate(built?.fromList?.rate ?? null),
    builds: built?.builds ?? [],
    frequency: built?.frequency ?? [],
    counters: built?.counters ?? [],
    meta,
    metaError: matchups.error instanceof Error ? matchups.error.message : null,
    metaLoading: matchups.isLoading,
    hasLocalData: view?.snapshot.hasLocalData ?? false,
  };
}

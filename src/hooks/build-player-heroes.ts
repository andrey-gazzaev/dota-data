import type { HeroInfo, MatchPerformance, PlayerSnapshot } from '@/models';
import { formatWinRate, heroStatsFromPerformances, mergeHeroStats, winRate } from '@/services';
import type { NamedHeroVm } from '@/view-models';

/** Named heroes from the snapshot and the saved matches. */
export function buildPlayerHeroes(
  snapshot: PlayerSnapshot,
  rows: MatchPerformance[],
  heroMap: Map<number, HeroInfo>,
): NamedHeroVm[] {
  return mergeHeroStats(snapshot.heroes, heroStatsFromPerformances(rows)).map((hero) => {
    const info = heroMap.get(hero.heroId);

    return {
      ...hero,
      name: info?.localizedName ?? `Герой ${hero.heroId}`,
      image: info?.image ?? '',
      attribute: info?.attribute ?? 'all',
      rate: winRate(hero.wins, hero.games),
      rateLabel: formatWinRate(winRate(hero.wins, hero.games)),
    };
  });
}

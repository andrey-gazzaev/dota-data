import type { CounterStat, HeroInfo, ItemInfo, MatchPerformance } from '@/models';
import {
  aggregateBuilds,
  aggregateCounters,
  formatWinRate,
  itemFrequency,
  recentPerformances,
  winRate,
} from '@/services';
import type { HeroSourceVm, NamedBuildVm, NamedCounterVm, NamedFrequencyVm, NamedItemVm } from '@/view-models';

function describeItem(map: Map<number, ItemInfo>, id: number): NamedItemVm {
  const item = map.get(id);
  return { id, name: item?.localizedName ?? `Предмет ${id}`, image: item?.image ?? '' };
}

function nameCounter(heroMap: Map<number, HeroInfo>, heroId: number, games: number, wins: number): NamedCounterVm {
  const info = heroMap.get(heroId);
  const value = winRate(wins, games);

  return {
    heroId,
    name: info?.localizedName ?? `Герой ${heroId}`,
    image: info?.image ?? '',
    games,
    rate: formatWinRate(value),
    value,
  };
}

/** Item sets, item rates, and counters from this player's matches on one hero. Empty when the catalog has not loaded. */
export function buildHeroDetails(
  heroId: number,
  heroMap: Map<number, HeroInfo> | undefined,
  itemMap: Map<number, ItemInfo> | undefined,
  heroes: HeroSourceVm['heroes'],
  rows: readonly MatchPerformance[] | undefined,
): {
  readonly info: HeroInfo | undefined;
  readonly fromList: NonNullable<HeroSourceVm['heroes']>[number] | undefined;
  readonly builds: readonly NamedBuildVm[];
  readonly frequency: readonly NamedFrequencyVm[];
  readonly counters: readonly NamedCounterVm[];
} | null {
  if (!heroMap || !itemMap) return null;

  const info = heroMap.get(heroId);
  const fromList = heroes?.find((hero) => hero.heroId === heroId);
  const recent = recentPerformances(rows ?? [], heroId);
  const builds: NamedBuildVm[] = aggregateBuilds(recent, heroId).map((build) => ({
    key: `${build.items.join('-')}-${build.neutralItem ?? 'n'}`,
    items: build.items.map((id) => describeItem(itemMap, id)),
    neutral: build.neutralItem ? describeItem(itemMap, build.neutralItem) : null,
    games: build.games,
    rate: formatWinRate(winRate(build.wins, build.games)),
  }));
  const frequency: NamedFrequencyVm[] = itemFrequency(recent, heroId)
    .slice(0, 12)
    .map((row) => ({
      ...describeItem(itemMap, row.itemId),
      games: row.games,
      rate: formatWinRate(winRate(row.wins, row.games)),
    }));
  const counters = aggregateCounters(recent, heroId, 2)
    .slice(0, 8)
    .map((row) => nameCounter(heroMap, row.heroId, row.games, row.wins));

  return { info, fromList, builds, frequency, counters };
}

/** Strongest public counters for one hero. */
export function buildHeroMeta(
  rows: readonly CounterStat[] | undefined,
  heroMap: Map<number, HeroInfo> | undefined,
): readonly NamedCounterVm[] {
  const names = heroMap ?? new Map<number, HeroInfo>();

  return (rows ?? [])
    .filter((row) => row.games >= 100)
    .sort((left, right) => (winRate(left.wins, left.games) ?? 0) - (winRate(right.wins, right.games) ?? 0))
    .slice(0, 8)
    .map((row) => nameCounter(names, row.heroId, row.games, row.wins));
}

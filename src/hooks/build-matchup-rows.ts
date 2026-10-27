import type { CounterStat, HeroInfo, HeroMeta } from '@/models';
import { formatPlural, formatWinRate, pickMatchups, winRate } from '@/services';
import type { MatchupRowVm } from '@/view-models';

const LIST_LIMIT = 15;

function gamesLabel(games: number): string {
  return formatPlural(games, ['игра', 'игры', 'игр']);
}

function nameRow(
  heroMap: Map<number, HeroInfo>,
  stat: { readonly heroId: number; readonly games: number; readonly wins: number },
): MatchupRowVm {
  const hero = heroMap.get(stat.heroId);
  const value = winRate(stat.wins, stat.games);

  return {
    heroId: stat.heroId,
    name: hero?.localizedName ?? `Герой ${stat.heroId}`,
    image: hero?.image ?? '',
    gamesLabel: gamesLabel(stat.games),
    rate: formatWinRate(value),
    value,
  };
}

/** Counters and synergies of one hero, ready to show. */
export function buildMatchupRows(
  selected: number,
  heroMap: Map<number, HeroInfo>,
  meta: HeroMeta,
  minGames: number,
): {
  readonly heroName: string;
  readonly counters: readonly MatchupRowVm[];
  readonly synergies: readonly MatchupRowVm[];
} {
  const others = (rows: readonly CounterStat[]) => rows.filter((row) => row.heroId !== selected);

  return {
    heroName: heroMap.get(selected)?.localizedName ?? `Герой ${selected}`,
    counters: pickMatchups(others(meta.counters), 'asc', minGames, LIST_LIMIT).map((stat) => nameRow(heroMap, stat)),
    synergies: pickMatchups(others(meta.synergies), 'desc', minGames, LIST_LIMIT).map((stat) => nameRow(heroMap, stat)),
  };
}

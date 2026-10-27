import { useMemo } from 'react';
import type { HeroInfo } from '@/models';
import { formatPlural } from '@/services';
import { useHeroMeta } from '@/queries';
import type { MatchupRankVm, MatchupRowVm } from '@/view-models';
import { buildMatchupRows } from './build-matchup-rows';
import { MIN_PAIR_GAMES } from './use-draft-tables';
import { useRankGroup } from './use-rank-group';

function gamesLabel(games: number): string {
  return formatPlural(games, ['игра', 'игры', 'игр']);
}

/** Counters and synergies of the selected hero. */
export type MatchupBoard = {
  /** True while matchup tables for the selected hero are loading. */
  readonly isMetaLoading: boolean;

  /** Load error for matchup tables. Empty when they loaded. */
  readonly metaError: string | null;

  /** Selected rank group. */
  readonly rank: MatchupRankVm;

  /** Selects a rank group. */
  readonly setRank: (rank: MatchupRankVm) => void;

  /** Rank filters. */
  readonly ranks: ReturnType<typeof useRankGroup>['ranks'];

  /** Sentence fragment for the selected rank group. */
  readonly rankCaption: string;

  /** Name of the selected hero. Empty when none is selected. */
  readonly heroName: string | null;

  /** Minimum sample size ready to show. */
  readonly minGamesLabel: string;

  /** Heroes this one loses to. Empty when none qualify. */
  readonly counters: readonly MatchupRowVm[];

  /** Heroes this one wins with. Empty when none qualify. */
  readonly synergies: readonly MatchupRowVm[];
};

/** Matchups of the selected hero. */
export function useMatchupBoard(selected: number | null, heroMap: Map<number, HeroInfo> | undefined): MatchupBoard {
  const { ranks, rank, setRank, rankCaption } = useRankGroup();
  const meta = useHeroMeta(selected, rank);

  const board = useMemo(() => {
    if (!heroMap || selected == null || !meta.data) return null;

    return buildMatchupRows(selected, heroMap, meta.data, MIN_PAIR_GAMES);
  }, [heroMap, selected, meta.data]);

  return {
    isMetaLoading: selected != null && meta.isPending,
    metaError: meta.error instanceof Error ? meta.error.message : null,
    rank,
    setRank,
    ranks,
    rankCaption,
    heroName: board?.heroName ?? heroMap?.get(selected ?? -1)?.localizedName ?? null,
    minGamesLabel: gamesLabel(MIN_PAIR_GAMES),
    counters: board?.counters ?? [],
    synergies: board?.synergies ?? [],
  };
}

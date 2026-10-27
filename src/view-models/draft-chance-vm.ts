import type { DraftPairViewVm } from './draft-pair-view-vm';

/** Allied win chance for the current picks. */
export type DraftChanceVm = {
  /** True while matchup tables for the current picks are loading. */
  readonly isMetaLoading: boolean;

  /** Load error for matchup tables. Empty when they loaded. */
  readonly metaError: string | null;

  /** Allied win chance ready to show. */
  readonly chance: string;

  /** Allied win chance from 0 to 1. Empty when the draft cannot be scored. */
  readonly chanceValue: number | null;

  /** Counter line ready to show. */
  readonly counterLine: string;

  /** Allied synergy line ready to show. */
  readonly allyLine: string;

  /** Enemy synergy line ready to show. */
  readonly enemyLine: string;

  /** Worst counter pair. Empty when there is no scored pair. */
  readonly worst: DraftPairViewVm | null;

  /** Best synergy pair. Empty when there is no scored pair. */
  readonly best: DraftPairViewVm | null;
};

import type { NamedItemVm } from './named-item-vm';

/** One item set with its games and win rate. */
export type NamedBuildVm = {
  /** Stable id of this item set. */
  readonly key: string;

  /** Items in the six slots. */
  readonly items: readonly NamedItemVm[];

  /** Neutral item. Empty when the set has none. */
  readonly neutral: NamedItemVm | null;

  /** Matches that used this set. */
  readonly games: number;

  /** Win rate ready to show. */
  readonly rate: string;
};

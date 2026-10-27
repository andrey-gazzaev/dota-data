/** A hero pair and its win rate, ready to show. */
export type DraftPairViewVm = {
  /** The two heroes and how they relate. */
  readonly label: string;

  /** Win rate ready to show. */
  readonly rate: string;

  /** Sample size ready to show. */
  readonly gamesLabel: string;
};

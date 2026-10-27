/** A repeated item set on a hero. Item order does not change which set it is. */
export type ItemBuild = {
  /** Item ids in this set. */
  readonly items: readonly number[];

  /** Neutral item id for this set. Empty when there was no neutral item. */
  readonly neutralItem: number | null;

  /** Matches played with this set. */
  readonly games: number;

  /** Wins among those matches. */
  readonly wins: number;
};

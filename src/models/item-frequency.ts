/** How often an item appears in a hero's builds, ignoring which other items were bought with it. */
export type ItemFrequency = {
  /** Item id. */
  readonly itemId: number;

  /** Matches where the item was in the build. */
  readonly games: number;

  /** Wins in those matches. */
  readonly wins: number;
};

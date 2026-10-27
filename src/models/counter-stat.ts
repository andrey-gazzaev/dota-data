/** Wins with or against one other hero. */
export type CounterStat = {
  /** The other hero. An enemy for counters, an ally for synergy. */
  readonly heroId: number;

  /** Matches with or against this hero. */
  readonly games: number;

  /** Wins in those matches. */
  readonly wins: number;
};

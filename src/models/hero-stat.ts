/** Games and wins for one hero on a player. */
export type HeroStat = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Matches played on this hero. */
  readonly games: number;

  /** Wins on this hero. */
  readonly wins: number;

  /** Start of the latest match, unix seconds. Empty when the time is unknown. */
  readonly lastPlayed: number | null;
};

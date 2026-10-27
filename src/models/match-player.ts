/** One other player in a parsed match. */
export type MatchPlayer = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Kills in this match. */
  readonly kills: number;

  /** Deaths in this match. */
  readonly deaths: number;

  /** Assists in this match. */
  readonly assists: number;
};

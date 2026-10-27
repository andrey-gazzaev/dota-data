/** One histogram column: games and wins inside a value range. */
export type HistogramBin = {
  /** Left edge of the range. For gold per minute, this is gold per minute. */
  readonly x: number;

  /** Matches that fell into the range. */
  readonly games: number;

  /** Wins inside the range. */
  readonly wins: number;
};

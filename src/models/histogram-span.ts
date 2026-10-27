/** A run of histogram columns treated as one range. */
export type HistogramSpan = {
  /** Left edge of the first bin in the span. */
  readonly from: number;

  /** Left edge of the last bin in the span. */
  readonly to: number;

  /** Matches inside the span. */
  readonly games: number;

  /** Wins inside the span. */
  readonly wins: number;
};

/** One column of a metric chart. */
export type MetricBinVm = {
  /** Range shown on the X axis. */
  readonly label: string;

  /** Wins in this step. */
  readonly wins: number;

  /** Losses in this step. */
  readonly losses: number;

  /** Matches in this step. */
  readonly games: number;

  /** Bar height when the Y axis is not win rate. Empty when the chart stacks wins and losses. */
  readonly value: number | null;
};

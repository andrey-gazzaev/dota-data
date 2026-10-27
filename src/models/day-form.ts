/** Wins and losses on one calendar day inside a recent match window. */
export type DayForm = {
  /** Local calendar day, `YYYY-MM-DD`. */
  readonly day: string;

  /** Earliest match start that day, unix seconds. */
  readonly time: number;

  /** Wins that day. */
  readonly wins: number;

  /** Losses that day. */
  readonly losses: number;
};

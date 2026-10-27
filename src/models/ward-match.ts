/** A parsed match that contains at least one ward log. */
export type WardMatch = {
  /** OpenDota match id. */
  readonly matchId: number;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. 0 when the length is unknown. */
  readonly duration: number;

  /** Hero the account played. 0 when that player is missing. */
  readonly heroId: number;
};

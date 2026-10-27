import type { WardMark } from './ward-mark';

/** Ward logs for one parsed match. */
export type MatchWards = {
  /** OpenDota match id. */
  readonly matchId: number;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. 0 when the length is unknown. */
  readonly duration: number;

  /** True when this match has a full parse. */
  readonly parsed: boolean;

  /** Every observer and sentry placed in the match, both teams. Empty when the match has no ward log. */
  readonly marks: readonly WardMark[];
};

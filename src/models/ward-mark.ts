import type { WardKind } from './ward-kind';

/** One ward placed in a match, with the moment it stopped existing. */
export type WardMark = {
  /** Observer or sentry. */
  readonly kind: WardKind;

  /** Horizontal game coordinate from the ward log. */
  readonly x: number;

  /** Vertical game coordinate from the ward log. */
  readonly y: number;

  /** Seconds from the horn when the ward was placed. Negative means before the horn. */
  readonly placedAt: number;

  /** Seconds from the horn when the ward was destroyed or expired. It is gone at this instant. */
  readonly leftAt: number;

  /** True when the placing player was on Radiant. */
  readonly radiant: boolean;

  /** Hero id of the player who placed the ward. 0 when the detail has no hero. */
  readonly heroId: number;
};

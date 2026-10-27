import type { CounterStat } from './counter-stat';

/** Public win rates of one hero against enemies and alongside allies. */
export type HeroMeta = {
  /** Hero the rates describe. */
  readonly heroId: number;

  /** One row per enemy hero. */
  readonly counters: readonly CounterStat[];

  /** One row per allied hero. */
  readonly synergies: readonly CounterStat[];
};

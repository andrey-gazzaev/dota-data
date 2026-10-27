import type { HistogramBin } from './histogram-bin';

/** OpenDota histograms that relate a combat stat to wins. */
export type OutcomeHistograms = {
  /** Kills histogram. Empty when OpenDota did not store one. */
  readonly kills: readonly HistogramBin[];

  /** Deaths histogram. Empty when OpenDota did not store one. */
  readonly deaths: readonly HistogramBin[];

  /** Assists histogram. Empty when OpenDota did not store one. */
  readonly assists: readonly HistogramBin[];

  /** Tower damage histogram. Empty when OpenDota did not store one. */
  readonly towerDamage: readonly HistogramBin[];
};

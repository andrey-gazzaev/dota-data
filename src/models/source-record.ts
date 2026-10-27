import type { DataSource } from './data-source';

/** Wins and losses from one source. */
export type SourceRecord = {
  /** Which source this row came from. */
  readonly source: DataSource;

  /** True when this source has a readable record. */
  readonly available: boolean;

  /** When the data was collected. Empty when the source was never collected. */
  readonly collectedAt: string | null;

  /** Wins. Empty when the source is unavailable. */
  readonly wins: number | null;

  /** Losses. Empty when the source is unavailable or results are unknown. */
  readonly losses: number | null;

  /** Matches counted when wins and losses are unknown. Empty when wins and losses are shown. */
  readonly games: number | null;

  /** Why the source was skipped. Empty when data is present. */
  readonly skipReason: string | null;
};

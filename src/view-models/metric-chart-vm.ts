import type { MetricBinVm } from './metric-bin-vm';

/** Columns for one metric widget. */
export type MetricChartVm = {
  /** True when the bars are stacked wins and losses. */
  readonly stacked: boolean;

  /** Columns from left to right. Empty when no match had both metrics. */
  readonly bins: readonly MetricBinVm[];
};

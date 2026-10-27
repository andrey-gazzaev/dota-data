import type { MetricAxisId, MetricMeasureId } from '@/models';

/** One chart saved on a dashboard. */
export type MetricWidgetVm = {
  /** Stable id for this card. */
  readonly id: string;

  /** Stat binned on the X axis. Empty until the user picks one. */
  readonly x: MetricAxisId | null;

  /** Measure on the Y axis. Empty until the user picks one. */
  readonly y: MetricMeasureId | null;

  /** Hero the chart counts. Empty when the chart covers the whole account. */
  readonly heroId: number | null;
};

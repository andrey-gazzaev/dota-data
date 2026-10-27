import { METRIC_AXIS_IDS } from './metric-axis';

/** Measures a chart can put on the Y axis, including win rate and match count. */
export const METRIC_MEASURE_IDS = [...METRIC_AXIS_IDS, 'winRate', 'games'] as const;

/** What a chart measures inside each bin of the X axis. */
export type MetricMeasureId = (typeof METRIC_MEASURE_IDS)[number];

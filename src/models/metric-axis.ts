/** Match stats that can be binned on a chart axis. */
export const METRIC_AXIS_IDS = [
  'kills',
  'deaths',
  'assists',
  'goldPerMin',
  'xpPerMin',
  'lastHits',
  'heroDamage',
  'towerDamage',
  'duration',
] as const;

/** A match stat that can be binned on a chart axis. */
export type MetricAxisId = (typeof METRIC_AXIS_IDS)[number];

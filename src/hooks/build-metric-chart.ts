import type { MatchPerformance, MetricAxisId, MetricMeasureId } from '@/models';
import { metricBins } from '@/services';
import type { MetricChartVm } from '@/view-models';

/** Columns for one metric widget. Empty when no match had both axes. */
export function buildMetricChart(
  rows: readonly MatchPerformance[],
  x: MetricAxisId,
  y: MetricMeasureId,
  heroId: number | null,
): MetricChartVm {
  return {
    stacked: y === 'winRate',
    bins: metricBins(rows, x, y, heroId).map((bin) => ({
      label: bin.label,
      wins: bin.wins,
      losses: bin.losses,
      games: bin.games,
      value: bin.value,
    })),
  };
}

import { memo, useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { usePlayerDataContext } from '@/context';
import { buildMetricChart } from '@/hooks';
import type { MetricAxisId, MetricMeasureId } from '@/models';

const tooltipStyle = { background: '#1b2219', border: '1px solid #343d30', borderRadius: 8 };

const metricChartComponent = function MetricChartComponent({
  x,
  y,
  heroId,
  valueLabel,
}: {
  readonly x: MetricAxisId;
  readonly y: MetricMeasureId;
  readonly heroId: number | null;
  readonly valueLabel: string;
}) {
  const player = usePlayerDataContext();
  const rows = player.view?.rows;

  const chart = useMemo(() => (rows ? buildMetricChart(rows, x, y, heroId) : null), [rows, x, y, heroId]);

  return (
    <>
      {player.isStatsLoading ? <p className="status">Считаем матчи…</p> : null}

      {chart && chart.bins.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={[...chart.bins]} margin={{ left: 4, right: 12, top: 4 }}>
            <XAxis dataKey="label" stroke="#9aa592" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis stroke="#9aa592" width={56} tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                value,
                chart.stacked ? (name === 'wins' ? 'Победы' : 'Поражения') : valueLabel,
              ]}
            />
            {chart.stacked ? <Bar dataKey="wins" stackId="result" fill="#8fce6a" /> : null}
            {chart.stacked ? (
              <Bar dataKey="losses" stackId="result" fill="#e07a5f" radius={[4, 4, 0, 0]} />
            ) : (
              <Bar dataKey="value" fill="#7f9a62" radius={4} />
            )}
          </BarChart>
        </ResponsiveContainer>
      ) : null}

      {chart && chart.bins.length === 0 && !player.isStatsLoading ? (
        <p className="status">Нет данных для графика</p>
      ) : null}
    </>
  );
};
metricChartComponent.displayName = 'MetricChart';
/** Wins, games, or an average across the steps of one stat. */
export const MetricChart = memo(metricChartComponent);

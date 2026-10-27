import type { MatchPerformance, MetricAxisId, MetricBin, MetricMeasureId } from '@/models';
import { mergeCloseBins, valueHistogram } from './performances';

const READ: Record<MetricAxisId, (row: MatchPerformance) => number | null> = {
  kills: (row) => row.kills,
  deaths: (row) => row.deaths,
  assists: (row) => row.assists,
  goldPerMin: (row) => row.goldPerMin,
  xpPerMin: (row) => row.xpPerMin,
  lastHits: (row) => row.lastHits,
  heroDamage: (row) => row.heroDamage,
  towerDamage: (row) => row.towerDamage,
  duration: (row) => row.duration,
};

const WIDTH: Record<MetricAxisId, number> = {
  kills: 1,
  deaths: 1,
  assists: 2,
  goldPerMin: 50,
  xpPerMin: 50,
  lastHits: 50,
  heroDamage: 5000,
  towerDamage: 1000,
  duration: 300,
};

function edgeLabel(from: number, to: number): string {
  const start = from.toLocaleString('ru-RU');
  if (from === to) return start;
  return `${start}–${to.toLocaleString('ru-RU')}`;
}

function scoped(rows: readonly MatchPerformance[], heroId: number | null): readonly MatchPerformance[] {
  if (heroId == null) return rows;
  return rows.filter((row) => row.heroId === heroId);
}

function counted(rows: readonly MatchPerformance[], x: MetricAxisId, y: 'winRate' | 'games'): MetricBin[] {
  const bins = valueHistogram(rows, READ[x], WIDTH[x]).filter((bin) => bin.games > 0);
  if (y === 'games') {
    return bins.map((bin) => ({
      label: bin.x.toLocaleString('ru-RU'),
      wins: bin.wins,
      losses: bin.games - bin.wins,
      games: bin.games,
      value: bin.games,
    }));
  }

  return mergeCloseBins(bins).map((span) => ({
    label: edgeLabel(span.from, span.to),
    wins: span.wins,
    losses: span.games - span.wins,
    games: span.games,
    value: null,
  }));
}

function averaged(rows: readonly MatchPerformance[], x: MetricAxisId, y: MetricAxisId): MetricBin[] {
  const groups = new Map<number, { readonly games: number; readonly wins: number; readonly sum: number }>();
  const width = WIDTH[x];

  for (const row of rows) {
    const xValue = READ[x](row);
    const yValue = READ[y](row);
    if (xValue == null || yValue == null || width <= 0) continue;

    const edge = Math.floor(xValue / width) * width;
    const current = groups.get(edge) ?? { games: 0, wins: 0, sum: 0 };
    groups.set(edge, {
      games: current.games + 1,
      wins: current.wins + (row.win ? 1 : 0),
      sum: current.sum + yValue,
    });
  }

  return [...groups.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([edge, group]) => ({
      label: edge.toLocaleString('ru-RU'),
      wins: group.wins,
      losses: group.games - group.wins,
      games: group.games,
      value: Math.round((group.sum / group.games) * 10) / 10,
    }));
}

/** Columns for one metric chart. Empty when no match had both axes. */
export function metricBins(
  rows: readonly MatchPerformance[],
  x: MetricAxisId,
  y: MetricMeasureId,
  heroId: number | null,
): MetricBin[] {
  const matches = scoped(rows, heroId);
  if (y === 'winRate' || y === 'games') return counted(matches, x, y);
  return averaged(matches, x, y);
}

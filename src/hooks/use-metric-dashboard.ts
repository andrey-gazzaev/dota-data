import { useCallback, useEffect, useState } from 'react';
import { METRIC_AXIS_IDS, METRIC_MEASURE_IDS, type MetricAxisId, type MetricMeasureId } from '@/models';
import type { MetricWidgetVm } from '@/view-models';

const KEY = 'dota-data:dashboard';
const LEGACY_KEY = 'dota-data:dashboard:player';

const DEFAULTS: readonly { readonly x: MetricAxisId; readonly y: MetricMeasureId }[] = [
  { x: 'goldPerMin', y: 'games' },
  { x: 'kills', y: 'winRate' },
  { x: 'deaths', y: 'winRate' },
  { x: 'assists', y: 'winRate' },
  { x: 'towerDamage', y: 'winRate' },
];

function isAxis(value: unknown): value is MetricAxisId {
  return METRIC_AXIS_IDS.some((id) => id === value);
}

function isMeasure(value: unknown): value is MetricMeasureId {
  return METRIC_MEASURE_IDS.some((id) => id === value);
}

function defaultWidgets(): MetricWidgetVm[] {
  return DEFAULTS.map((axes) => ({ id: crypto.randomUUID(), heroId: null, x: axes.x, y: axes.y }));
}

function heroIdOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function parseWidget(value: unknown): MetricWidgetVm | null {
  if (!value || typeof value !== 'object') return null;

  const record = value as {
    readonly id?: unknown;
    readonly x?: unknown;
    readonly y?: unknown;
    readonly heroId?: unknown;
  };
  if (typeof record.id !== 'string' || record.id.length === 0) return null;
  if (record.x != null && !isAxis(record.x)) return null;
  if (record.y != null && !isMeasure(record.y)) return null;

  return {
    id: record.id,
    x: isAxis(record.x) ? record.x : null,
    y: isMeasure(record.y) ? record.y : null,
    heroId: heroIdOf(record.heroId),
  };
}

function load(): readonly MetricWidgetVm[] {
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (raw == null) return defaultWidgets();

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return defaultWidgets();

    return parsed.flatMap((item) => {
      const widget = parseWidget(item);
      return widget ? [widget] : [];
    });
  } catch {
    return defaultWidgets();
  }
}

function save(widgets: readonly MetricWidgetVm[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(widgets));
  } catch {
    // The layout stays in memory when storage is blocked.
  }
}

/** Saved charts on the dashboard, plus add, remove, and reorder. */
export function useMetricDashboard() {
  const [widgets, setWidgets] = useState(() => load());

  useEffect(() => {
    save(widgets);
  }, [widgets]);

  const add = useCallback(() => {
    setWidgets((current) => [...current, { id: crypto.randomUUID(), heroId: null, x: null, y: null }]);
  }, []);

  const remove = useCallback((id: string) => {
    setWidgets((current) => current.filter((widget) => widget.id !== id));
  }, []);

  const move = useCallback((id: string, direction: -1 | 1) => {
    setWidgets((current) => {
      const index = current.findIndex((widget) => widget.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;

      const next = [...current];
      const [widget] = next.splice(index, 1);
      if (!widget) return current;
      next.splice(target, 0, widget);
      return next;
    });
  }, []);

  const setAxes = useCallback((id: string, x: MetricAxisId | null, y: MetricMeasureId | null) => {
    setWidgets((current) => current.map((widget) => (widget.id === id ? { ...widget, x, y } : widget)));
  }, []);

  const setHero = useCallback((id: string, heroId: number | null) => {
    setWidgets((current) => current.map((widget) => (widget.id === id ? { ...widget, heroId } : widget)));
  }, []);

  return { widgets, add, remove, move, setAxes, setHero };
}

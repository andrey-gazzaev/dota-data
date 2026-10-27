import { memo, useMemo } from 'react';
import { usePlayerDataContext } from '@/context';
import { METRIC_AXIS_IDS, type MetricAxisId, type MetricMeasureId } from '@/models';
import { Button, Panel, SelectField } from '@/ui';
import type { MetricWidgetVm } from '@/view-models';
import { MetricChart } from './metric-chart';
import styles from './metric-widget.module.css';

const AXIS_LABEL: Record<MetricAxisId, string> = {
  kills: 'Киллы',
  deaths: 'Смерти',
  assists: 'Ассисты',
  goldPerMin: 'GPM',
  xpPerMin: 'XPM',
  lastHits: 'Ластхиты',
  heroDamage: 'Урон по героям',
  towerDamage: 'Урон по строениям',
  duration: 'Длительность',
};

const MEASURE_LABEL: Record<MetricMeasureId, string> = {
  winRate: 'Винрейт',
  games: 'Игры',
  ...AXIS_LABEL,
};

const MEASURE_ORDER: readonly MetricMeasureId[] = ['winRate', 'games', ...METRIC_AXIS_IDS];

function axisId(value: string): MetricAxisId | null {
  return METRIC_AXIS_IDS.find((id) => id === value) ?? null;
}

function measureId(value: string): MetricMeasureId | null {
  return MEASURE_ORDER.find((id) => id === value) ?? null;
}

function heroIdOf(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const metricWidgetComponent = function MetricWidgetComponent({
  widget,
  first,
  last,
  onAxes,
  onHero,
  onMove,
  onRemove,
}: {
  readonly widget: MetricWidgetVm;
  readonly first: boolean;
  readonly last: boolean;
  readonly onAxes: (x: MetricAxisId | null, y: MetricMeasureId | null) => void;
  readonly onHero: (heroId: number | null) => void;
  readonly onMove: (direction: -1 | 1) => void;
  readonly onRemove: () => void;
}) {
  const player = usePlayerDataContext();
  const heroes = useMemo(
    () =>
      [...(player.view?.heroes ?? [])].sort(
        (left, right) => right.games - left.games || left.name.localeCompare(right.name, 'ru'),
      ),
    [player.view?.heroes],
  );

  const x = widget.x;
  const y = widget.y;
  const hero = heroes.find((item) => item.heroId === widget.heroId);
  const heroLabel = hero?.name ?? (widget.heroId != null ? `Герой ${widget.heroId}` : null);
  const title = [x ? AXIS_LABEL[x] : null, y ? MEASURE_LABEL[y] : null, heroLabel].filter(Boolean).join(' · ');

  return (
    <Panel>
      <div className={styles.axes}>
        <label className={styles.axis}>
          Ось X
          <SelectField value={widget.x ?? ''} onChange={(event) => onAxes(axisId(event.target.value), widget.y)}>
            <option value="">Выберите</option>
            {METRIC_AXIS_IDS.map((id) => (
              <option key={id} value={id}>
                {AXIS_LABEL[id]}
              </option>
            ))}
          </SelectField>
        </label>

        <label className={styles.axis}>
          Ось Y
          <SelectField value={widget.y ?? ''} onChange={(event) => onAxes(widget.x, measureId(event.target.value))}>
            <option value="">Выберите</option>
            {MEASURE_ORDER.map((id) => (
              <option key={id} value={id}>
                {MEASURE_LABEL[id]}
              </option>
            ))}
          </SelectField>
        </label>

        <label className={styles.axis}>
          Герой
          <SelectField
            value={widget.heroId == null ? '' : String(widget.heroId)}
            onChange={(event) => onHero(heroIdOf(event.target.value))}
          >
            <option value="">Весь аккаунт</option>
            {widget.heroId != null && hero == null ? <option value={widget.heroId}>{heroLabel}</option> : null}
            {heroes.map((item) => (
              <option key={item.heroId} value={item.heroId}>
                {item.name} · {item.games}
              </option>
            ))}
          </SelectField>
        </label>

        <div className={styles.actions}>
          <Button variant="ghost" disabled={first} onClick={() => onMove(-1)}>
            Левее
          </Button>
          <Button variant="ghost" disabled={last} onClick={() => onMove(1)}>
            Правее
          </Button>
          <Button variant="ghost" onClick={onRemove}>
            Удалить
          </Button>
        </div>
      </div>

      <div className={styles.chart}>
        {x != null && y != null ? (
          <>
            <h2>{title}</h2>
            <MetricChart x={x} y={y} heroId={widget.heroId} valueLabel={MEASURE_LABEL[y]} />
          </>
        ) : (
          <p className="status">Выберите метрики для осей</p>
        )}
      </div>
    </Panel>
  );
};
metricWidgetComponent.displayName = 'MetricWidget';
/** One dashboard chart and the controls that change it. */
export const MetricWidget = memo(metricWidgetComponent);

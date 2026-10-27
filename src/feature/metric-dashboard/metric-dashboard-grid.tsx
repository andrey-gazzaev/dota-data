import { memo } from 'react';
import { useMetricDashboard } from '@/hooks';
import { Button } from '@/ui';
import styles from './metric-dashboard.module.css';
import { MetricWidget } from './metric-widget';

const metricDashboardGridComponent = function MetricDashboardGridComponent() {
  const dashboard = useMetricDashboard();

  return (
    <div className={styles.board}>
      <div className={styles.toolbar}>
        <Button onClick={dashboard.add}>Добавить виджет</Button>
      </div>

      <div className={styles.grid}>
        {dashboard.widgets.map((widget, index) => (
          <MetricWidget
            key={widget.id}
            widget={widget}
            first={index === 0}
            last={index === dashboard.widgets.length - 1}
            onAxes={(x, y) => dashboard.setAxes(widget.id, x, y)}
            onHero={(heroId) => dashboard.setHero(widget.id, heroId)}
            onMove={(direction) => dashboard.move(widget.id, direction)}
            onRemove={() => dashboard.remove(widget.id)}
          />
        ))}
      </div>
    </div>
  );
};
metricDashboardGridComponent.displayName = 'MetricDashboardGrid';
/** Charts the user adds, reorders, and removes. */
export const MetricDashboardGrid = memo(metricDashboardGridComponent);

import { memo } from 'react';
import { PlayerDataProvider } from '@/context';
import { MetricDashboardGrid } from './metric-dashboard-grid';

const metricDashboardComponent = function MetricDashboardComponent({ accountId }: { readonly accountId: number }) {
  return (
    <PlayerDataProvider accountId={accountId}>
      <MetricDashboardGrid />
    </PlayerDataProvider>
  );
};
metricDashboardComponent.displayName = 'MetricDashboard';
/** Metric charts for one account. */
export const MetricDashboard = memo(metricDashboardComponent);

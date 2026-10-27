import { memo } from 'react';
import { MetricDashboard } from '@/feature';
import { Page } from '@/ui';

const dashboardPageComponent = function DashboardPageComponent({ accountId }: { readonly accountId: number }) {
  return (
    <Page>
      <MetricDashboard accountId={accountId} />
    </Page>
  );
};
dashboardPageComponent.displayName = 'DashboardPage';
/** Custom metric charts for one account. */
export const DashboardPage = memo(dashboardPageComponent);

import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardPage } from '@/pages';

const dashboardRouteComponent = function DashboardRouteComponent() {
  const accountId = Number(useParams().accountId);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  return <DashboardPage accountId={accountId} />;
};
dashboardRouteComponent.displayName = 'DashboardRoute';
/** Dashboard page for the account in the URL. */
export const DashboardRoute = memo(dashboardRouteComponent);

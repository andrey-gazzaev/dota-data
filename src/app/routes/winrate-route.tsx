import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { WinratePage } from '@/pages';

const winrateRouteComponent = function WinrateRouteComponent() {
  const accountId = Number(useParams().accountId);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  return <WinratePage accountId={accountId} />;
};
winrateRouteComponent.displayName = 'WinrateRoute';
/** Win-rate page for the account in the URL. */
export const WinrateRoute = memo(winrateRouteComponent);

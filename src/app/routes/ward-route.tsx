import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { WardPage } from '@/pages';

const wardRouteComponent = function WardRouteComponent() {
  const accountId = Number(useParams().accountId);
  const rawMatch = useParams().matchId;
  const matchId = rawMatch == null ? null : Number(rawMatch);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  if (matchId != null && (!Number.isSafeInteger(matchId) || matchId <= 0)) {
    return <p className="status">Некорректный id</p>;
  }
  return <WardPage accountId={accountId} matchId={matchId} />;
};
wardRouteComponent.displayName = 'WardRoute';
/** Ward map for the account and match in the URL. */
export const WardRoute = memo(wardRouteComponent);

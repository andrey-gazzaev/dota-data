import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { PlayerPage } from '@/pages';

const playerRouteComponent = function PlayerRouteComponent() {
  const accountId = Number(useParams().accountId);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  return <PlayerPage accountId={accountId} />;
};
playerRouteComponent.displayName = 'PlayerRoute';
/** Player page for the account in the URL. */
export const PlayerRoute = memo(playerRouteComponent);

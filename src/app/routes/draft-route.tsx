import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { DraftPage } from '@/pages';

const draftRouteComponent = function DraftRouteComponent() {
  const accountId = Number(useParams().accountId);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  return <DraftPage accountId={accountId} />;
};
draftRouteComponent.displayName = 'DraftRoute';
/** Draft page for the account in the URL. */
export const DraftRoute = memo(draftRouteComponent);

import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { HeroPage } from '@/pages';

const heroRouteComponent = function HeroRouteComponent() {
  const accountId = Number(useParams().accountId);
  const heroId = Number(useParams().heroId);
  if (!Number.isSafeInteger(accountId) || accountId <= 0 || !Number.isSafeInteger(heroId) || heroId <= 0) {
    return <p className="status">Некорректный id</p>;
  }
  return <HeroPage accountId={accountId} heroId={heroId} />;
};
heroRouteComponent.displayName = 'HeroRoute';
/** Hero page for the account and hero in the URL. */
export const HeroRoute = memo(heroRouteComponent);

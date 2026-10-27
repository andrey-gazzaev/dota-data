import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { MatchupPage } from '@/pages';

const matchupRouteComponent = function MatchupRouteComponent() {
  const accountId = Number(useParams().accountId);
  const rawHero = useParams().heroId;
  const heroId = rawHero == null ? null : Number(rawHero);
  if (!Number.isSafeInteger(accountId) || accountId <= 0) return <p className="status">Некорректный id</p>;
  if (heroId != null && (!Number.isSafeInteger(heroId) || heroId <= 0)) {
    return <p className="status">Некорректный id</p>;
  }
  return <MatchupPage accountId={accountId} heroId={heroId} />;
};
matchupRouteComponent.displayName = 'MatchupRoute';
/** Matchup page for the account and hero in the URL. */
export const MatchupRoute = memo(matchupRouteComponent);

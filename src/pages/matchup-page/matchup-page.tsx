import { memo } from 'react';
import { Matchups } from '@/feature';
import { usePlayerData } from '@/hooks';
import { Page } from '@/ui';

const matchupPageComponent = function MatchupPageComponent({
  accountId,
  heroId,
}: {
  readonly accountId: number;
  readonly heroId: number | null;
}) {
  const player = usePlayerData(accountId);

  return (
    <Page>
      <Matchups
        accountId={accountId}
        heroId={heroId}
        isLoading={player.isLoading}
        error={player.error}
        heroes={player.view?.heroes}
        heroMap={player.view?.heroMap}
      />
    </Page>
  );
};
matchupPageComponent.displayName = 'MatchupPage';
/** Matchups for one account. */
export const MatchupPage = memo(matchupPageComponent);

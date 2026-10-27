import { memo } from 'react';
import { PlayerBoard } from '@/widgets';
import { Page } from '@/ui';

const playerPageComponent = function PlayerPageComponent({ accountId }: { readonly accountId: number }) {
  return (
    <Page>
      <PlayerBoard accountId={accountId} />
    </Page>
  );
};
playerPageComponent.displayName = 'PlayerPage';
/** Overview of one account. */
export const PlayerPage = memo(playerPageComponent);

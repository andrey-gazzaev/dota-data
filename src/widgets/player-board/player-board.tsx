import { memo } from 'react';
import { PlayerDataProvider } from '@/context';
import { PlayerHeader, RecentMatches } from '@/feature';

const playerBoardComponent = function PlayerBoardComponent({ accountId }: { readonly accountId: number }) {
  return (
    <PlayerDataProvider accountId={accountId}>
      <PlayerHeader />
      <RecentMatches />
    </PlayerDataProvider>
  );
};
playerBoardComponent.displayName = 'PlayerBoard';
/** Header and recent matches for one player. */
export const PlayerBoard = memo(playerBoardComponent);

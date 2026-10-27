import { memo, useMemo, type ReactNode } from 'react';
import { usePlayerData } from '@/hooks';
import { PlayerDataContext, type PlayerDataValue } from './player-data-context';

const playerDataProviderComponent = function PlayerDataProviderComponent({
  accountId,
  children,
}: {
  readonly accountId: number;
  readonly children: ReactNode;
}) {
  const player = usePlayerData(accountId);

  const value = useMemo(
    (): PlayerDataValue => ({
      accountId,
      view: player.view,
      isLoading: player.isLoading,
      isStatsLoading: player.isStatsLoading,
      error: player.error,
    }),
    [accountId, player.view, player.isLoading, player.isStatsLoading, player.error],
  );

  return <PlayerDataContext.Provider value={value}>{children}</PlayerDataContext.Provider>;
};
playerDataProviderComponent.displayName = 'PlayerDataProvider';
/** Loads one player once and shares that snapshot with the board. */
export const PlayerDataProvider = memo(playerDataProviderComponent);

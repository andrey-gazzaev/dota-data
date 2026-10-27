import { useContext } from 'react';
import { PlayerDataContext, type PlayerDataValue } from './player-data-context';

/** Player data for the surrounding board. Throws when there is no provider. */
export function usePlayerDataContext(): PlayerDataValue {
  const value = useContext(PlayerDataContext);

  if (value === undefined) throw new Error('usePlayerDataContext must be used within a PlayerDataProvider');

  return value;
}

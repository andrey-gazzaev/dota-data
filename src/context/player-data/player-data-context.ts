import { createContext } from 'react';
import type { PlayerViewVm } from '@/view-models';

/** Player data shared with every widget on one board. */
export type PlayerDataValue = {
  /** Account the board is showing. */
  readonly accountId: number;

  /** Built page. Empty while the snapshot has not loaded. */
  readonly view: PlayerViewVm | null;

  /** True while the snapshot is loading. */
  readonly isLoading: boolean;

  /** True while match rows are still loading. */
  readonly isStatsLoading: boolean;

  /** Load error. Empty when the snapshot loaded. */
  readonly error: string | null;
};

/** Shared inside this module. Call `usePlayerDataContext` instead. */
export const PlayerDataContext = createContext<PlayerDataValue | undefined>(undefined);

import type { HeroInfo, ItemInfo, MatchPerformance } from '@/models';
import type { RecentHeroVm } from './recent-hero-vm';

/** Matches and catalog the recent list is built from. */
export type RecentSourceVm = {
  /** True while the player snapshot is loading. */
  readonly isLoading: boolean;

  /** Saved matches. Empty when they have not loaded. */
  readonly rows: readonly MatchPerformance[] | undefined;

  /** Catalog heroes by id. Empty when the catalog has not loaded. */
  readonly heroMap: Map<number, HeroInfo> | undefined;

  /** Catalog items by id. Empty when the catalog has not loaded. */
  readonly itemMap: Map<number, ItemInfo> | undefined;

  /** Heroes the list can filter by. Empty when they have not loaded. */
  readonly heroes: readonly RecentHeroVm[] | undefined;
};

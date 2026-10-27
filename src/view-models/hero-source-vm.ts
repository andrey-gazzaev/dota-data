import type { HeroInfo, ItemInfo, MatchPerformance } from '@/models';

/** Player matches and catalog the hero page is built from. */
export type HeroSourceVm = {
  /** True while the player snapshot is loading. */
  readonly isLoading: boolean;

  /** True while match rows are still loading. */
  readonly isStatsLoading: boolean;

  /** Load error. Empty when the snapshot loaded. */
  readonly error: string | null;

  /** True when a saved snapshot exists for this player. */
  readonly hasLocalData: boolean;

  /** Catalog heroes by id. Empty when the catalog has not loaded. */
  readonly heroMap: Map<number, HeroInfo> | undefined;

  /** Catalog items by id. Empty when the catalog has not loaded. */
  readonly itemMap: Map<number, ItemInfo> | undefined;

  /** Heroes this player has played. Empty when they have not loaded. */
  readonly heroes:
    | readonly {
        /** Hero id in the Dota catalog. */
        readonly heroId: number;

        /** Matches on this hero. */
        readonly games: number;

        /** Wins on this hero. */
        readonly wins: number;

        /** Win rate from 0 to 1. Empty when the hero has no games. */
        readonly rate: number | null;
      }[]
    | undefined;

  /** Saved matches. Empty when they have not loaded. */
  readonly rows: readonly MatchPerformance[] | undefined;
};

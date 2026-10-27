import type { HeroInfo, ItemInfo, MatchPerformance, PlayerSnapshot } from '@/models';
import type { NamedHeroVm } from './named-hero-vm';

/** Saved player, heroes, and matches the board is built from. */
export type PlayerViewVm = {
  /** Saved profile the page is built from. */
  readonly snapshot: PlayerSnapshot;

  /** Rank line. Empty when no rank was recorded. */
  readonly rankLabel: string | null;

  /** Heroes this player has played, with names. */
  readonly heroes: readonly NamedHeroVm[];

  /** Catalog heroes by id. */
  readonly heroMap: Map<number, HeroInfo>;

  /** Catalog items by id. */
  readonly itemMap: Map<number, ItemInfo>;

  /** Saved matches, newest first. */
  readonly rows: readonly MatchPerformance[];
};

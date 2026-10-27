import type { HeroInfo } from '@/models';
import type { MatchupHeroVm } from './matchup-hero-vm';

/** Player heroes the matchup page is built from. */
export type MatchupSourceVm = {
  /** True while the player snapshot is loading. */
  readonly isLoading: boolean;

  /** Load error. Empty when the snapshot loaded. */
  readonly error: string | null;

  /** Heroes the player can open. Empty when they have not loaded. */
  readonly heroes:
    | readonly {
        /** Hero id in the Dota catalog. */
        readonly heroId: number;

        /** Display name. */
        readonly name: string;

        /** Matches the player has on this hero. */
        readonly games: number;

        /** Portrait URL. Empty when the catalog has no image. */
        readonly image: string;

        /** Primary attribute. `all` means a universal hero. */
        readonly attribute: MatchupHeroVm['attribute'];
      }[]
    | undefined;

  /** Catalog heroes by id. Empty when the catalog has not loaded. */
  readonly heroMap: Map<number, HeroInfo> | undefined;
};

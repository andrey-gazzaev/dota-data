import type { HeroInfo } from './hero-info';
import type { ItemInfo } from './item-info';

/** Hero and item names and images. */
export type GameCatalog = {
  /** Every hero known to OpenDota. */
  readonly heroes: readonly HeroInfo[];

  /** Every item known to OpenDota. */
  readonly items: readonly ItemInfo[];
};

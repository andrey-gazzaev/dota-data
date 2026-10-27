import type { HeroInfo, HeroStat } from '@/models';

/** Games and win rate on one hero, with its name. */
export type NamedHeroVm = HeroStat & {
  /** Display name. A placeholder when the catalog has no hero. */
  readonly name: string;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Primary attribute. `all` means a universal hero, including when the catalog has no hero. */
  readonly attribute: HeroInfo['attribute'];

  /** Win rate from 0 to 1. Empty when the hero has no games. */
  readonly rate: number | null;

  /** Win rate ready to show. */
  readonly rateLabel: string;
};

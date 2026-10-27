import type { DraftHeroVm } from './draft-hero-vm';

/** Heroes of one attribute. */
export type DraftClassVm = {
  /** Attribute id: `str`, `agi`, `int`, or `all`. */
  readonly id: string;

  /** Attribute name shown above the group. */
  readonly title: string;

  /** Heroes in this group, most played first. */
  readonly heroes: readonly DraftHeroVm[];
};

import type { MatchupHeroVm } from './matchup-hero-vm';

/** Heroes of one attribute. */
export type MatchupClassVm = {
  /** Attribute id: `str`, `agi`, `int`, or `all`. */
  readonly id: string;

  /** Attribute name shown above the group. */
  readonly title: string;

  /** Heroes in this group, most played first. */
  readonly heroes: readonly MatchupHeroVm[];
};

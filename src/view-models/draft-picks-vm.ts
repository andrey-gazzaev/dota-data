import type { DraftClassVm } from './draft-class-vm';
import type { DraftSideVm } from './draft-side-vm';
import type { DraftSlotVm } from './draft-slot-vm';
import type { MatchupRankVm } from './matchup-rank-vm';

/** Heroes picked on each side, and the rank they are scored at. */
export type DraftPicksVm = {
  /** True while the player snapshot is loading. */
  readonly isLoading: boolean;

  /** Load error for the player snapshot. Empty when it loaded. */
  readonly error: string | null;

  /** Heroes grouped by attribute. */
  readonly classes: readonly DraftClassVm[];

  /** Rank filters. */
  readonly ranks: readonly {
    /** Rank group id. */
    readonly id: MatchupRankVm;

    /** Short name of the rank group. */
    readonly label: string;

    /** Sentence fragment naming the ranks in the group. */
    readonly caption: string;
  }[];

  /** Selected rank group. */
  readonly rank: MatchupRankVm;

  /** Selects a rank group. */
  readonly setRank: (rank: MatchupRankVm) => void;

  /** Sentence fragment for the selected rank group. */
  readonly rankCaption: string;

  /** Side the next pick joins. */
  readonly side: DraftSideVm;

  /** Chooses which side the next pick joins. */
  readonly setSide: (side: DraftSideVm) => void;

  /** True when the allied side already has five heroes. */
  readonly alliesFull: boolean;

  /** True when the enemy side already has five heroes. */
  readonly enemiesFull: boolean;

  /** Hero ids already picked on either side. */
  readonly taken: Set<number>;

  /** Allied picks, padded with empty slots. */
  readonly allySlots: readonly DraftSlotVm[];

  /** Enemy picks, padded with empty slots. */
  readonly enemySlots: readonly DraftSlotVm[];

  /** Adds or removes a hero on the active side. */
  readonly toggleHero: (id: number) => void;

  /** Removes a hero from either side. */
  readonly removeHero: (id: number) => void;

  /** True when at least one hero is picked. */
  readonly hasPicks: boolean;
};

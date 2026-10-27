import type { DraftChanceVm } from './draft-chance-vm';
import type { DraftPicksVm } from './draft-picks-vm';
import type { DraftSuggestionsVm } from './draft-suggestions-vm';

/** Draft picks, win chance, and suggested heroes. */
export type DraftViewVm = {
  /** Heroes picked on each side, and the rank they are scored at. */
  readonly picks: DraftPicksVm;

  /** Allied win chance for those picks. */
  readonly chance: DraftChanceVm;

  /** Heroes that most help the current draft. */
  readonly suggestions: DraftSuggestionsVm;
};

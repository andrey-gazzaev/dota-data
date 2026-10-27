import type { DraftSuggestionVm } from './draft-suggestion-vm';

/** Heroes that most help the current draft. */
export type DraftSuggestionsVm = {
  /** Starts looking for heroes that raise the win chance. */
  readonly askSuggestion: () => void;

  /** Adds a suggested hero to the allied side. */
  readonly takeSuggestion: (id: number) => void;

  /** True when a suggestion can be requested. */
  readonly canSuggest: boolean;

  /** True after a suggestion was requested. */
  readonly suggesting: boolean;

  /** True while suggestion tables are still loading. */
  readonly suggestionPending: boolean;

  /** Heroes that most help the current draft. Empty when none qualify. */
  readonly suggestions: readonly DraftSuggestionVm[];
};

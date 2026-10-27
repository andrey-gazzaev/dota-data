/** A hero the draft can add, with the change in win chance. */
export type DraftSuggestionVm = {
  /** Hero id in the Dota catalog. */
  readonly id: number;

  /** Display name. */
  readonly name: string;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Win chance after adding this hero, ready to show. */
  readonly chance: string;

  /** Change in win chance, in percentage points. Empty when the current chance is unknown. */
  readonly delta: string | null;
};

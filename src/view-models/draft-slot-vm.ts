/** A picked hero, or an empty slot. */
export type DraftSlotVm = {
  /** Hero id in the Dota catalog. */
  readonly id: number;

  /** Display name. */
  readonly name: string;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;
} | null;

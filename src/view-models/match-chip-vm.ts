/** A hero or item image with its name. */
export type MatchChipVm = {
  /** Hero or item id. */
  readonly id: number;

  /** Display name. */
  readonly name: string;

  /** Image URL. Empty when the catalog has no image. */
  readonly image: string;
};

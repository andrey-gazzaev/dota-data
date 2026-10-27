/** An item with its catalog name and image. */
export type NamedItemVm = {
  /** Item id in the Dota catalog. */
  readonly id: number;

  /** Display name. A placeholder when the catalog has no item. */
  readonly name: string;

  /** Image URL. Empty when the catalog has no image. */
  readonly image: string;
};

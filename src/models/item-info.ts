/** Item card from the constants catalog. */
export type ItemInfo = {
  /** Item id in Dota. */
  readonly id: number;

  /** Technical name, for example `item_magic_wand`. */
  readonly name: string;

  /** Name shown to the player. */
  readonly localizedName: string;

  /** Icon URL. */
  readonly image: string;
};

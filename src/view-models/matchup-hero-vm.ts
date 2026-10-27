/** A hero the player can open matchups for. */
export type MatchupHeroVm = {
  /** Hero id in the Dota catalog. */
  readonly id: number;

  /** Display name. */
  readonly name: string;

  /** Matches the player has on this hero. */
  readonly games: number;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Primary attribute. `all` means a universal hero. */
  readonly attribute: 'str' | 'agi' | 'int' | 'all';
};

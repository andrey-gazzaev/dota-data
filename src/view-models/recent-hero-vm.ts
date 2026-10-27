/** A hero the recent-match list can filter by. */
export type RecentHeroVm = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Display name. */
  readonly name: string;

  /** Matches on this hero in the recent list. */
  readonly games: number;
};

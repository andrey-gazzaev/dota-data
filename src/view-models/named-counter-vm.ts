/** A hero and the win rate against them. */
export type NamedCounterVm = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Display name. */
  readonly name: string;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Matches against this hero. */
  readonly games: number;

  /** Win rate ready to show. */
  readonly rate: string;

  /** Win rate from 0 to 1. Empty when there are no games. */
  readonly value: number | null;
};

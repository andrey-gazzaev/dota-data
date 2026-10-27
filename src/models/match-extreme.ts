/** One extreme value inside a recent window of matches. */
export type MatchExtreme = {
  /** Stat this record is for. */
  readonly key: 'deaths' | 'kills' | 'assists' | 'towerDamage' | 'heroDamage' | 'goldPerMin' | 'lastHits';

  /** Dota match id of the extreme game. */
  readonly matchId: number;

  /** Hero played in that game. */
  readonly heroId: number;

  /** The player won that game. */
  readonly win: boolean;

  /** Extreme value of the stat. */
  readonly value: number;

  /** Match length in seconds. Empty when the source did not send it. */
  readonly duration: number | null;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Matches in the window that recorded this stat. */
  readonly sample: number;

  /** Matches considered, at most the requested window. */
  readonly window: number;
};

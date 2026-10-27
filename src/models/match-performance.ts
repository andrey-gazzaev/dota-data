import type { DataSource } from './data-source';
import type { MatchPlayer } from './match-player';

/** One player's result in a single match. */
export type MatchPerformance = {
  /** Dota match id. */
  readonly matchId: number;

  /** Source this row was taken from. */
  readonly source: DataSource;

  /** Player's hero id. */
  readonly heroId: number;

  /** The player won this match. */
  readonly win: boolean;

  /** Player kills. */
  readonly kills: number;

  /** Player deaths. */
  readonly deaths: number;

  /** Player assists. */
  readonly assists: number;

  /** Gold per minute. Empty when the source did not send it. */
  readonly goldPerMin: number | null;

  /** Experience per minute. Empty when the source did not send it. */
  readonly xpPerMin: number | null;

  /** Damage dealt to buildings. Empty when the source did not send it. */
  readonly towerDamage: number | null;

  /** Damage dealt to heroes. Empty when the source did not send it. */
  readonly heroDamage: number | null;

  /** Creep last hits. Empty when the source did not send them. */
  readonly lastHits: number | null;

  /** Item ids in the six slots. Zero means an empty slot. */
  readonly items: readonly number[];

  /** Neutral item id. Empty when there was no neutral slot. */
  readonly neutralItem: number | null;

  /** Item ids in the order they were bought. Empty when the source has no purchase log. */
  readonly purchases: readonly number[];

  /** Enemy hero ids. */
  readonly enemyHeroIds: readonly number[];

  /** Teammates, excluding this player. Empty when the match is not parsed. */
  readonly allies: readonly MatchPlayer[];

  /** Opponents. Empty when the match is not parsed. */
  readonly enemies: readonly MatchPlayer[];

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. Empty when the source did not send it. */
  readonly duration: number | null;
};

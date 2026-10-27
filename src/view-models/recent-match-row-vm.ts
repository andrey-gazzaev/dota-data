import type { LineupChipVm } from './lineup-chip-vm';
import type { MatchChipVm } from './match-chip-vm';

/** One recent match, ready to show. */
export type RecentMatchRowVm = {
  /** Dota match id. */
  readonly matchId: number;

  /** Match date ready to show. */
  readonly date: string;

  /** Hero name. */
  readonly hero: string;

  /** Hero portrait URL. Empty when the catalog has no image. */
  readonly heroImage: string;

  /** Kills, deaths, and assists. */
  readonly score: string;

  /** True when the player won. */
  readonly win: boolean;

  /** Win or loss label. */
  readonly result: string;

  /** Match length ready to show. */
  readonly length: string;

  /** True when the match has a parsed lineup. */
  readonly parsed: boolean;

  /** Gold per minute. Empty when the source did not send it. */
  readonly goldPerMin: number | null;

  /** Experience per minute. Empty when the source did not send it. */
  readonly xpPerMin: number | null;

  /** Items in the six slots. */
  readonly items: readonly MatchChipVm[];

  /** Neutral item. Empty when there was no neutral slot. */
  readonly neutral: MatchChipVm | null;

  /** Items in the order they were bought. */
  readonly purchases: readonly MatchChipVm[];

  /** Teammates, excluding this player. */
  readonly allies: readonly LineupChipVm[];

  /** Opponents. */
  readonly enemies: readonly LineupChipVm[];

  /** Draft win chance ready to show. A dash when it cannot be scored. */
  readonly draftLabel: string;

  /** Color of the draft chance. `muted` when it cannot be scored. */
  readonly draftTone: 'win' | 'loss' | 'muted';
};

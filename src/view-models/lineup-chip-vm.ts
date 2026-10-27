import type { MatchChipVm } from './match-chip-vm';

/** A hero in a lineup, with their score. */
export type LineupChipVm = MatchChipVm & {
  /** Kills, deaths, and assists. */
  readonly score: string;
};

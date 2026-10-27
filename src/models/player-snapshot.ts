import type { HeroStat } from './hero-stat';
import type { HistogramBin } from './histogram-bin';
import type { OutcomeHistograms } from './outcome-histograms';
import type { SourceRecord } from './source-record';

/** Profile, records, and hero totals for one account. */
export type PlayerSnapshot = {
  /** Steam account id, not SteamID64. */
  readonly accountId: number;

  /** Name shown in the header. */
  readonly personaName: string;

  /** Avatar URL. Empty when the profile did not send one. */
  readonly avatarUrl: string | null;

  /** Profile URL. Empty when none is available. */
  readonly profileUrl: string | null;

  /** OpenDota medal. Empty when rank was not recorded. */
  readonly rankTier: number | null;

  /** Leaderboard place. Empty outside the top list. */
  readonly leaderboardRank: number | null;

  /** OpenDota MMR estimate. Empty when it was not sent. */
  readonly computedMmr: number | null;

  /** STRATZ medal. Empty when STRATZ did not send a rank. */
  readonly seasonRank: number | null;

  /** Win/loss record for each source. */
  readonly records: readonly SourceRecord[];

  /** Heroes this player has played. */
  readonly heroes: readonly HeroStat[];

  /** Gold-per-minute counts. Empty when the chart comes from the matches. */
  readonly gpmHistogram: readonly HistogramBin[];

  /** Win rate by kills, deaths, assists, and tower damage. Empty when the chart comes from the matches. */
  readonly outcomes: OutcomeHistograms;

  /** True when a saved snapshot exists for this player. */
  readonly hasLocalData: boolean;
};

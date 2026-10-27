import { z } from 'zod';
import { heroStatSchema } from './hero-stat.schema';
import { histogramBinSchema } from './histogram-bin.schema';
import { sourceRecordSchema } from './source-record.schema';

/** Profile, records, and hero totals for one account. */
export const playerSnapshotSchema = z.object({
  accountId: z.number(),
  personaName: z.string(),
  avatarUrl: z.string().nullable(),
  profileUrl: z.string().nullable(),
  rankTier: z.number().nullable(),
  leaderboardRank: z.number().nullable(),
  computedMmr: z.number().nullable(),
  seasonRank: z.number().nullable(),
  records: z.array(sourceRecordSchema),
  heroes: z.array(heroStatSchema),
  gpmHistogram: z.array(histogramBinSchema),
  outcomes: z.object({
    kills: z.array(histogramBinSchema),
    deaths: z.array(histogramBinSchema),
    assists: z.array(histogramBinSchema),
    towerDamage: z.array(histogramBinSchema),
  }),
  hasLocalData: z.boolean(),
});

/** A player snapshot from the API. */
export type PlayerSnapshotDto = z.infer<typeof playerSnapshotSchema>;

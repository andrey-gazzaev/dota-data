import { z } from 'zod';
import { dataSourceSchema } from './data-source.schema';

/** Wins and losses from one source. */
export const sourceRecordSchema = z.object({
  source: dataSourceSchema,
  available: z.boolean(),
  collectedAt: z.string().nullable(),
  wins: z.number().nullable(),
  losses: z.number().nullable(),
  games: z.number().nullable(),
  skipReason: z.string().nullable(),
});

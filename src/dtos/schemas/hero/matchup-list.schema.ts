import { z } from 'zod';
import { matchupSchema } from './matchup.schema';

/** Matchups for one hero. */
export const matchupListSchema = z.object({
  heroId: z.number(),
  matchups: z.array(matchupSchema),
});

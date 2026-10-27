import { z } from 'zod';
import { matchupSchema } from './matchup.schema';

/** Counters and synergies for one hero. */
export const heroMetaSchema = z.object({
  heroId: z.number(),
  counters: z.array(matchupSchema),
  synergies: z.array(matchupSchema),
});

/** Counters and synergies from the API. */
export type HeroMetaDto = z.infer<typeof heroMetaSchema>;

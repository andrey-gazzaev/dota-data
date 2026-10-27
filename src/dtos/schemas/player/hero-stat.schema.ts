import { z } from 'zod';

/** Games and wins on one hero. */
export const heroStatSchema = z.object({
  heroId: z.number(),
  games: z.number(),
  wins: z.number(),
  lastPlayed: z.number().nullable(),
});

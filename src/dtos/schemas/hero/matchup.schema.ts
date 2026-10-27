import { z } from 'zod';

/** Games and wins against one hero. */
export const matchupSchema = z.object({
  heroId: z.number(),
  games: z.number(),
  wins: z.number(),
});

/** Games and wins against one hero, from the API. */
export type MatchupDto = z.infer<typeof matchupSchema>;

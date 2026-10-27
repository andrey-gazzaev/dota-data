import { z } from 'zod';

/** One player in a match lineup. */
export const matchPlayerSchema = z.object({
  heroId: z.number(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
});

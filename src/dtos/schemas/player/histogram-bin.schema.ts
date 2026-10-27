import { z } from 'zod';

/** One step of a win-rate histogram. */
export const histogramBinSchema = z.object({
  x: z.number(),
  games: z.number(),
  wins: z.number(),
});

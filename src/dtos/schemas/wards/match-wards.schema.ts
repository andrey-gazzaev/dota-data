import { z } from 'zod';
import { wardMarkSchema } from './ward-mark.schema';

/** Ward placements in one match. */
export const matchWardsSchema = z.object({
  matchId: z.number(),
  startTime: z.number(),
  duration: z.number(),
  parsed: z.boolean(),
  marks: z.array(wardMarkSchema),
});

/** Ward placements from the API. */
export type MatchWardsDto = z.infer<typeof matchWardsSchema>;

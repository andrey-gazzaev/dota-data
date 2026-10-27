import { z } from 'zod';

/** A match that can be opened on the ward map. */
export const wardMatchSchema = z.object({
  matchId: z.number(),
  startTime: z.number(),
  duration: z.number(),
  heroId: z.number(),
});

/** A ward-map match from the API. */
export type WardMatchDto = z.infer<typeof wardMatchSchema>;

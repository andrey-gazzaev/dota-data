import { z } from 'zod';
import { wardMatchSchema } from './ward-match.schema';

/** Matches that can be opened on the ward map. */
export const wardMatchListSchema = z.object({
  matches: z.array(wardMatchSchema),
});

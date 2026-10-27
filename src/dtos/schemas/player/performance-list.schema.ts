import { z } from 'zod';
import { performanceSchema } from './performance.schema';

/** Matches stored for one account. */
export const performanceListSchema = z.object({
  rows: z.array(performanceSchema),
});

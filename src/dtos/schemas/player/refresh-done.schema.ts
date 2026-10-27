import { z } from 'zod';
import { refreshResultSchema } from './refresh-result.schema';

/** Outcome of a finished refresh. */
export const refreshDoneSchema = z.object({
  results: z.array(refreshResultSchema),
});

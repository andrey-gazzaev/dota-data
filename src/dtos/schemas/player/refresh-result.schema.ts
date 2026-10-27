import { z } from 'zod';
import { dataSourceSchema } from './data-source.schema';

/** Outcome of refreshing one source. */
export const refreshResultSchema = z.object({
  source: dataSourceSchema,
  status: z.enum(['updated', 'skipped', 'error']),
  message: z.string(),
});

/** Outcome of refreshing one source, from the API. */
export type RefreshResultDto = z.infer<typeof refreshResultSchema>;

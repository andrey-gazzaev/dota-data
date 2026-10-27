import { z } from 'zod';

/** How many requests a refresh still expects. */
export const estimateSchema = z.object({
  remainingMs: z.number(),
  done: z.number(),
  planned: z.number(),
  detailsKnown: z.boolean(),
});

/** Expected requests for the rest of a refresh. */
export type EstimateDto = z.infer<typeof estimateSchema>;

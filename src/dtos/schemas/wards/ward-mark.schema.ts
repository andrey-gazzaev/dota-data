import { z } from 'zod';

/** One ward placement. */
export const wardMarkSchema = z.object({
  kind: z.enum(['observer', 'sentry']),
  x: z.number(),
  y: z.number(),
  placedAt: z.number(),
  leftAt: z.number(),
  radiant: z.boolean(),
  heroId: z.number(),
});

/** One ward placement from the API. */
export type WardMarkDto = z.infer<typeof wardMarkSchema>;

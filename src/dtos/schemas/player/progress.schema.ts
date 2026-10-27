import { z } from 'zod';

/** How far a refresh or parse has got. */
export const progressSchema = z.object({
  source: z.string(),
  phase: z.string(),
  message: z.string(),
});

/** Progress of a refresh or parse. */
export type ProgressDto = z.infer<typeof progressSchema>;

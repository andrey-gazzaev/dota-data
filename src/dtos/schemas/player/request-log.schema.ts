import { z } from 'zod';

/** One outbound request during a refresh. */
export const requestLogSchema = z.object({
  id: z.number(),
  method: z.string(),
  target: z.string(),
  status: z.number().nullable(),
  ms: z.number().nullable(),
  note: z.string().nullable(),
});

/** One request from the refresh log. */
export type RequestLogDto = z.infer<typeof requestLogSchema>;

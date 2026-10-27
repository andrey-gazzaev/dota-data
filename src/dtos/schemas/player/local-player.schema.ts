import { z } from 'zod';
import { dataSourceSchema } from './data-source.schema';

/** An account that has a saved snapshot. */
export const localPlayerSchema = z.object({
  accountId: z.number(),
  personaName: z.string(),
  sources: z.array(dataSourceSchema),
});

/** A saved account from the API. */
export type LocalPlayerDto = z.infer<typeof localPlayerSchema>;

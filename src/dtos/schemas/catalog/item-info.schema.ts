import { z } from 'zod';

/** One item in the catalog. */
export const itemInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  localizedName: z.string(),
  image: z.string(),
});

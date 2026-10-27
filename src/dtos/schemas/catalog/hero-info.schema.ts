import { z } from 'zod';

/** One hero in the catalog. */
export const heroInfoSchema = z.object({
  id: z.number(),
  localizedName: z.string(),
  shortName: z.string(),
  attribute: z.enum(['str', 'agi', 'int', 'all']),
  image: z.string(),
});

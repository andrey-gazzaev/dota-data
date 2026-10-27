import { z } from 'zod';
import { heroInfoSchema } from './hero-info.schema';
import { itemInfoSchema } from './item-info.schema';

/** Hero and item constants. */
export const catalogSchema = z.object({
  heroes: z.array(heroInfoSchema),
  items: z.array(itemInfoSchema),
});

/** Hero and item constants from the API. */
export type CatalogDto = z.infer<typeof catalogSchema>;

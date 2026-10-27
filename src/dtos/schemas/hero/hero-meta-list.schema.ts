import { z } from 'zod';
import { heroMetaSchema } from './hero-meta.schema';

/** Counters and synergies for every hero. */
export const heroMetaListSchema = z.object({
  heroes: z.array(heroMetaSchema),
});

/** Counters and synergies for every hero, from the API. */
export type HeroMetaListDto = z.infer<typeof heroMetaListSchema>;

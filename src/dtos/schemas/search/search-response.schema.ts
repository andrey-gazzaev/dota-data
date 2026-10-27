import { z } from 'zod';
import { searchCandidateSchema } from './search-candidate.schema';

/** Players matching a search. */
export const searchResponseSchema = z.object({
  players: z.array(searchCandidateSchema),
});

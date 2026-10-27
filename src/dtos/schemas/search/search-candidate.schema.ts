import { z } from 'zod';

/** A player that matched a search. */
export const searchCandidateSchema = z.object({
  accountId: z.number(),
  personaName: z.string(),
  avatarUrl: z.string().nullable(),
  lastMatchTime: z.number().nullable(),
});

/** A search match from the API. */
export type SearchCandidateDto = z.infer<typeof searchCandidateSchema>;

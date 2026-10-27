import type { SearchCandidate } from '@/models';
import type { SearchCandidateDto } from '../../schemas/search/search-candidate.schema';

/** A player that matched a search. */
export function mapSearchCandidate(dto: SearchCandidateDto): SearchCandidate {
  return { ...dto };
}

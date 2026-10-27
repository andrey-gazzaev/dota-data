import type { SearchCandidate } from '@/models';
import { api } from '../../http';
import { mapSearchCandidate } from '../../mappers/search/map-search-candidate';
import { searchResponseSchema } from '../../schemas/search/search-response.schema';

/** Player lookup by nickname or account id. */
export class SearchApi {
  /** Players matching a nickname or account id. */
  public async find(query: string): Promise<SearchCandidate[]> {
    const { data } = await api.get(`/api/search?q=${encodeURIComponent(query)}`);
    const payload = searchResponseSchema.parse(data);
    return payload.players.map(mapSearchCandidate);
  }
}

/** Shared search client. */
export const searchApi = new SearchApi();

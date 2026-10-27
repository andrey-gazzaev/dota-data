import type { MatchWards, WardMatch } from '@/models';
import { api } from '../../http';
import { mapMatchWards } from '../../mappers/wards/map-match-wards';
import { mapWardMatch } from '../../mappers/wards/map-ward-match';
import { matchWardsSchema } from '../../schemas/wards/match-wards.schema';
import { wardMatchListSchema } from '../../schemas/wards/ward-match-list.schema';

/** Ward matches and marks for one account. */
export class WardApi {
  /** Parsed matches that contain a ward log. */
  public async matches(accountId: number): Promise<WardMatch[]> {
    const { data } = await api.get(`/api/players/${accountId}/ward-matches`);
    const payload = wardMatchListSchema.parse(data);
    return payload.matches.map(mapWardMatch);
  }

  /** Ward placements in one match. */
  public async marks(accountId: number, matchId: number): Promise<MatchWards> {
    const { data } = await api.get(`/api/players/${accountId}/matches/${matchId}/wards`);
    const dto = matchWardsSchema.parse(data);
    return mapMatchWards(dto);
  }
}

/** Shared ward client. */
export const wardApi = new WardApi();

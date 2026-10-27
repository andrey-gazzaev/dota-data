import type { WardMatch } from '@/models';
import type { WardMatchDto } from '../../schemas/wards/ward-match.schema';

/** A match that can be opened on the ward map. */
export function mapWardMatch(dto: WardMatchDto): WardMatch {
  return {
    matchId: dto.matchId,
    startTime: dto.startTime,
    duration: dto.duration,
    heroId: dto.heroId,
  };
}

import type { MatchWards } from '@/models';
import type { MatchWardsDto } from '../../schemas/wards/match-wards.schema';
import { mapWardMark } from './map-ward-mark';

/** Ward placements in one match. */
export function mapMatchWards(dto: MatchWardsDto): MatchWards {
  return {
    matchId: dto.matchId,
    startTime: dto.startTime,
    duration: dto.duration,
    parsed: dto.parsed,
    marks: dto.marks.map(mapWardMark),
  };
}

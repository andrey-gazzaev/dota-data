import type { WardMark } from '@/models';
import type { WardMarkDto } from '../../schemas/wards/ward-mark.schema';

/** One ward placement. */
export function mapWardMark(dto: WardMarkDto): WardMark {
  return {
    kind: dto.kind,
    x: dto.x,
    y: dto.y,
    placedAt: dto.placedAt,
    leftAt: dto.leftAt,
    radiant: dto.radiant,
    heroId: dto.heroId,
  };
}

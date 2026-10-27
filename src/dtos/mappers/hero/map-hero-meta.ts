import type { HeroMeta } from '@/models';
import type { HeroMetaDto } from '../../schemas/hero/hero-meta.schema';
import { mapMatchup } from './map-matchup';

/** Counters and synergies for one hero. */
export function mapHeroMeta(dto: HeroMetaDto): HeroMeta {
  return {
    heroId: dto.heroId,
    counters: dto.counters.map(mapMatchup),
    synergies: dto.synergies.map(mapMatchup),
  };
}

/** Counters and synergies for every hero. */
export function mapHeroMetas(heroes: readonly HeroMetaDto[]): HeroMeta[] {
  return heroes.map(mapHeroMeta);
}

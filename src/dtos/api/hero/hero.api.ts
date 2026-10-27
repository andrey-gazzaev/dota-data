import type { CounterStat, HeroMeta } from '@/models';
import { api } from '../../http';
import { mapHeroMeta, mapHeroMetas } from '../../mappers/hero/map-hero-meta';
import { mapMatchup } from '../../mappers/hero/map-matchup';
import { heroMetaListSchema } from '../../schemas/hero/hero-meta-list.schema';
import { heroMetaSchema } from '../../schemas/hero/hero-meta.schema';
import { matchupListSchema } from '../../schemas/hero/matchup-list.schema';

/** OpenDota matchups and STRATZ hero meta. */
export class HeroApi {
  /** How this hero does against other heroes. */
  public async matchups(heroId: number): Promise<CounterStat[]> {
    const { data } = await api.get(`/api/heroes/${heroId}/matchups`);
    const payload = matchupListSchema.parse(data);
    return payload.matchups.map(mapMatchup);
  }

  /** Counters and synergies for this hero at one rank. All ranks when the bracket is empty. */
  public async meta(heroId: number, bracket: string | null): Promise<HeroMeta> {
    const query = bracket ? `?bracket=${encodeURIComponent(bracket)}` : '';
    const { data } = await api.get(`/api/heroes/${heroId}/meta${query}`);
    const payload = heroMetaSchema.parse(data);
    return mapHeroMeta(payload);
  }

  /** Counters and synergies for every hero at one rank. All ranks when the bracket is empty. */
  public async metas(bracket: string | null): Promise<HeroMeta[]> {
    const query = bracket ? `?bracket=${encodeURIComponent(bracket)}` : '';
    const { data } = await api.get(`/api/heroes/meta${query}`);
    const payload = heroMetaListSchema.parse(data);
    return mapHeroMetas(payload.heroes);
  }
}

/** Shared hero client. */
export const heroApi = new HeroApi();

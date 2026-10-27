import { useQuery } from '@tanstack/react-query';
import { heroApi } from '@/dtos';
import { heroKeys } from '../keys';

const HOUR = 60 * 60 * 1000;

/** Counters and synergies for one hero at one rank. Idle when no hero is selected. */
export function useHeroMeta(heroId: number | null, rank: string) {
  return useQuery({
    queryKey: heroKeys.meta(rank),
    queryFn: async () => {
      const heroes = await heroApi.metas(rank === 'all' ? null : rank);
      return new Map(heroes.map((hero) => [hero.heroId, hero]));
    },
    enabled: heroId != null,
    select: (heroes) => (heroId == null ? undefined : heroes.get(heroId)),
    staleTime: HOUR,
    retry: 1,
  });
}

import { useQuery } from '@tanstack/react-query';
import { heroApi } from '@/dtos';
import { heroKeys } from '../keys';

const HOUR = 60 * 60 * 1000;

/** Counters and synergies for every hero at one rank. */
export function useHeroMetas(rank: string) {
  return useQuery({
    queryKey: heroKeys.meta(rank),
    queryFn: async () => {
      const heroes = await heroApi.metas(rank === 'all' ? null : rank);
      return new Map(heroes.map((hero) => [hero.heroId, hero]));
    },
    staleTime: HOUR,
    retry: 1,
  });
}

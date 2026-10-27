import { useQuery } from '@tanstack/react-query';
import { heroApi } from '@/dtos';
import { heroKeys } from '../keys';

const HOUR = 60 * 60 * 1000;

/** How this hero does against other heroes. */
export function useHeroMatchups(heroId: number) {
  return useQuery({
    queryKey: heroKeys.matchups(heroId),
    queryFn: () => heroApi.matchups(heroId),
    staleTime: HOUR,
    retry: 1,
  });
}

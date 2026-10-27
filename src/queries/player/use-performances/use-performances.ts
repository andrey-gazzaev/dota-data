import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@/dtos';
import { playerKeys } from '../keys';

/** Matches stored for one account. */
export function usePerformances(accountId: number) {
  return useQuery({
    queryKey: playerKeys.performances(accountId),
    queryFn: () => playerApi.performances(accountId),
  });
}

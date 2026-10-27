import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@/dtos';
import { playerKeys } from '../keys';

/** Accounts that already have a saved snapshot. */
export function useLocalPlayers() {
  return useQuery({
    queryKey: playerKeys.list,
    queryFn: () => playerApi.list(),
  });
}

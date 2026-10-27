import { useQuery } from '@tanstack/react-query';
import { playerApi } from '@/dtos';
import { playerKeys } from '../keys';

/** Saved profile, records, and hero totals for one account. */
export function usePlayerSnapshot(accountId: number) {
  return useQuery({
    queryKey: playerKeys.detail(accountId),
    queryFn: () => playerApi.snapshot(accountId),
  });
}

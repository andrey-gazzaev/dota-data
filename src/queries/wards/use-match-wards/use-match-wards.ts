import { useQuery } from '@tanstack/react-query';
import { wardApi } from '@/dtos';
import { wardKeys } from '../keys';

/** Ward placements in one match. Idle when no match is selected. */
export function useMatchWards(accountId: number, matchId: number | null) {
  return useQuery({
    queryKey: wardKeys.match(accountId, matchId),
    queryFn: () => wardApi.marks(accountId, matchId ?? 0),
    enabled: matchId != null,
  });
}

import { useQuery } from '@tanstack/react-query';
import { wardApi } from '@/dtos';
import { wardKeys } from '../keys';

/** Parsed matches that contain a ward log. */
export function useWardMatches(accountId: number) {
  return useQuery({
    queryKey: wardKeys.matches(accountId),
    queryFn: () => wardApi.matches(accountId),
  });
}

import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '@/dtos';
import { catalogKeys } from '../keys';

const DAY = 24 * 60 * 60 * 1000;

/** Hero and item catalog. */
export function useCatalog() {
  return useQuery({
    queryKey: catalogKeys.all,
    queryFn: () => catalogApi.load(),
    staleTime: DAY,
    retry: 1,
  });
}

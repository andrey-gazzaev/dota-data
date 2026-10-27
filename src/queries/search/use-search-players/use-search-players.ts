import { useQueryClient } from '@tanstack/react-query';
import { searchApi } from '@/dtos';
import { searchKeys } from '../keys';

/** Search for a player by nickname or account id. */
export function useSearchPlayers() {
  const client = useQueryClient();
  return (query: string) =>
    client.fetchQuery({
      queryKey: searchKeys.text(query),
      queryFn: () => searchApi.find(query),
    });
}

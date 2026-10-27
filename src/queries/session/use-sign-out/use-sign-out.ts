import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '@/dtos';
import { playerKeys } from '../../player/keys';
import { sessionKeys } from '../keys';

/** Drops the session and the cached players. */
export function useSignOut() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: () => sessionApi.leave(),
    onSuccess: () => {
      client.setQueryData(sessionKeys.current, null);
      client.removeQueries({ queryKey: playerKeys.all });
    },
  });
}

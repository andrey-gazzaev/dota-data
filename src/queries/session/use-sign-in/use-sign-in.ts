import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi } from '@/dtos';
import { playerKeys } from '../../player/keys';
import { sessionKeys } from '../keys';

/** Opens a session and drops another person's cached players. */
export function useSignIn() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (login: string) => sessionApi.enter(login),
    onSuccess: (user) => {
      client.setQueryData(sessionKeys.current, user);
      client.removeQueries({ queryKey: playerKeys.all });
    },
  });
}

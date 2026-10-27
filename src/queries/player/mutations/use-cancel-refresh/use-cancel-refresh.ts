import { useMutation } from '@tanstack/react-query';
import { playerApi } from '@/dtos';

/** Stops an in-progress refresh for this account. */
export function useCancelRefresh(accountId: number) {
  return useMutation({
    mutationFn: () => {
      playerApi.cancelRefresh(accountId);
      return Promise.resolve();
    },
  });
}

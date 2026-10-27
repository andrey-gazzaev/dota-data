import { useMutation } from '@tanstack/react-query';
import { playerApi } from '@/dtos';

/** Stops an in-progress match parse for this account. */
export function useCancelDetails(accountId: number) {
  return useMutation({
    mutationFn: () => {
      playerApi.cancelDetails(accountId);
      return Promise.resolve();
    },
  });
}

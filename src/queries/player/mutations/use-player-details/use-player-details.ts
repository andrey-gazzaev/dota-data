import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi, type ProgressDto } from '@/dtos';
import { playerKeys } from '../../keys';
import { wardKeys } from '../../../wards/keys';

function stopped(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'Разбор отменён')
  );
}

/** Parses selected matches and refreshes the lists that depend on them. */
export function usePlayerDetails(accountId: number) {
  const client = useQueryClient();

  async function refreshStored() {
    await client.invalidateQueries({ queryKey: playerKeys.performances(accountId) });
    await client.invalidateQueries({ queryKey: wardKeys.account(accountId) });
  }

  return useMutation({
    mutationFn: (input: {
      readonly matchIds: readonly number[];
      readonly onProgress: (event: ProgressDto) => void;
      readonly signal?: AbortSignal;
    }) =>
      playerApi.details(
        accountId,
        input.matchIds,
        (event) => {
          input.onProgress(event);
          if (event.phase === 'saved') void refreshStored();
        },
        input.signal,
      ),
    onSuccess: () => refreshStored(),
    onError: (error) => {
      if (stopped(error)) void refreshStored();
    },
  });
}

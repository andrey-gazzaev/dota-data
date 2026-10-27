import { useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi, type EstimateDto, type ProgressDto, type RequestLogDto } from '@/dtos';
import { playerKeys } from '../../keys';

function stopped(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'Обновление отменено')
  );
}

/** Refreshes this account and reloads the saved snapshot when it finishes. */
export function useRefreshPlayer(accountId: number) {
  const client = useQueryClient();

  async function refreshStored() {
    await client.invalidateQueries({ queryKey: playerKeys.detail(accountId) });
    await client.invalidateQueries({ queryKey: playerKeys.list });
  }

  return useMutation({
    mutationFn: (input: {
      readonly onProgress: (event: ProgressDto) => void;
      readonly onLog: (event: RequestLogDto) => void;
      readonly onEstimate: (event: EstimateDto) => void;
      readonly signal?: AbortSignal;
    }) =>
      playerApi.refresh(
        accountId,
        {
          onProgress: (event) => {
            input.onProgress(event);
            if (event.phase === 'saved') void refreshStored();
          },
          onLog: input.onLog,
          onEstimate: input.onEstimate,
        },
        input.signal,
      ),
    onSuccess: () => refreshStored(),
    onError: (error) => {
      if (stopped(error)) void refreshStored();
    },
  });
}

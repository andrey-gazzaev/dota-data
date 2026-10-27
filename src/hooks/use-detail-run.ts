import { useRef, useState } from 'react';
import { useCancelDetails, usePlayerDetails } from '@/queries';

/** Words shown while a match parse runs. */
type DetailRunMessages = {
  /** Status shown when the parse starts. */
  readonly start: string;

  /** Status shown when the parse is saved. Empty when the line should clear. */
  readonly done: string | null;

  /** Error shown when the parse fails without a message. */
  readonly failed: string;
};

function stopped(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'Разбор отменён')
  );
}

/** Starts a match parse and keeps its progress until it finishes or is cancelled. */
export function useDetailRun(accountId: number) {
  const parseDetails = usePlayerDetails(accountId);
  const cancelDetails = useCancelDetails(accountId);
  const stopRef = useRef<AbortController | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(matchIds: readonly number[], messages: DetailRunMessages) {
    if (matchIds.length === 0 || running) return;

    const controller = new AbortController();
    stopRef.current = controller;
    setRunning(true);
    setError(null);
    setStatus(messages.start);

    try {
      await parseDetails.mutateAsync({
        matchIds,
        onProgress: (event) => setStatus(event.message),
        signal: controller.signal,
      });
      setStatus(messages.done);
    } catch (caught) {
      if (stopped(caught)) {
        setStatus('Разбор отменён');
      } else {
        setError(caught instanceof Error ? caught.message : messages.failed);
      }
    } finally {
      stopRef.current = null;
      setRunning(false);
    }
  }

  function cancel() {
    stopRef.current?.abort();
    cancelDetails.mutate();
  }

  return { running, status, error, run, cancel };
}

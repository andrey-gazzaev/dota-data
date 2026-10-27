import { useEffect, useRef, useState } from 'react';
import type { EstimateDto, RequestLogDto } from '@/dtos';
import { useCancelRefresh, useRefreshPlayer } from '@/queries';

function stopped(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'CanceledError' || error.message === 'Обновление отменено')
  );
}

function upsert(logs: RequestLogDto[], entry: RequestLogDto): RequestLogDto[] {
  const index = logs.findIndex((row) => row.id === entry.id);
  if (index < 0) return [...logs, entry];

  const next = logs.slice();
  next[index] = entry;
  return next;
}

/** Starts, watches, and cancels a data refresh. */
export function useRefreshRun(accountId: number) {
  const refreshPlayer = useRefreshPlayer(accountId);
  const cancelRefresh = useCancelRefresh(accountId);
  const stopRef = useRef<AbortController | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<RequestLogDto[]>([]);
  const [estimate, setEstimate] = useState<{ readonly snapshot: EstimateDto; readonly at: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [details, setDetails] = useState(false);
  const [logOpen, setLogOpen] = useState(true);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  async function start() {
    const controller = new AbortController();
    stopRef.current = controller;
    setRunning(true);
    setError(null);
    setLogs([]);
    setEstimate(null);
    setDetails(false);
    setLogOpen(true);
    setStatus('Запускаем обновление');

    try {
      const results = await refreshPlayer.mutateAsync({
        onProgress: (event) => {
          setStatus(event.message);
          if (event.phase === 'details') setDetails(true);
        },
        onLog: (entry) => setLogs((current) => upsert(current, entry)),
        onEstimate: (entry) => {
          const at = Date.now();
          setNow(at);
          setEstimate({ snapshot: entry, at });
        },
        signal: controller.signal,
      });
      setStatus(results.map((result) => result.message).join('\n'));
    } catch (caught) {
      if (stopped(caught)) {
        setStatus('Обновление отменено');
      } else {
        setError(caught instanceof Error ? caught.message : 'Не удалось обновить');
      }
    } finally {
      stopRef.current = null;
      setRunning(false);
    }
  }

  function cancel() {
    stopRef.current?.abort();
    cancelRefresh.mutate();
  }

  const elapsed = estimate ? now - estimate.at : 0;

  return { running, details, status, error, start, cancel, logs, estimate, elapsed, logOpen, setLogOpen };
}

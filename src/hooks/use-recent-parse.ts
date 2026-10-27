import { useDetailRun } from './use-detail-run';

/** A way to parse the recent matches that have no lineup. */
export function useRecentParse(accountId: number, missing: readonly number[], total: number) {
  const detail = useDetailRun(accountId);

  async function parseMatches() {
    await detail.run(missing, {
      start: 'Запускаем разбор',
      done: 'Разбор сохранён',
      failed: 'Не удалось разобрать матчи',
    });
  }

  return {
    parsedCount: total - missing.length,
    missingCount: missing.length,
    running: detail.running,
    status: detail.status,
    error: detail.error,
    parseMatches,
    cancel: detail.cancel,
  };
}

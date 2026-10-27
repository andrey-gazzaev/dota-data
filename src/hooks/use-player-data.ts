import { useMemo } from 'react';
import { useCatalog, usePerformances, usePlayerSnapshot } from '@/queries';
import { dedupePerformances } from '@/services';
import { buildPlayerView } from './build-player-view';

/** Saved player and the page built from that snapshot. */
export function usePlayerData(accountId: number) {
  const snapshot = usePlayerSnapshot(accountId);
  const performances = usePerformances(accountId);
  const catalog = useCatalog();

  const rows = useMemo(() => dedupePerformances(performances.data ?? []), [performances.data]);
  const view = useMemo(
    () => (snapshot.data ? buildPlayerView(snapshot.data, rows, catalog.data) : null),
    [snapshot.data, rows, catalog.data],
  );
  const error =
    snapshot.error instanceof Error ? snapshot.error.message : snapshot.error ? 'Не удалось загрузить игрока' : null;

  return {
    view,
    isLoading: snapshot.isLoading,
    isStatsLoading: performances.isLoading,
    error,
  };
}

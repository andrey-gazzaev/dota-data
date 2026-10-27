import { useCallback, useMemo, useState } from 'react';
import { useDetailRun } from '@/hooks';
import type { GameCatalog } from '@/models';
import { useCatalog, useMatchWards, useWardMatches } from '@/queries';
import { formatDate, formatGameClock, wardMapImage } from '@/services';
import { buildWardPins } from './build-ward-pins';

function heroName(catalog: GameCatalog | undefined, heroId: number): string {
  if (heroId <= 0) return 'Герой';

  return catalog?.heroes.find((hero) => hero.id === heroId)?.localizedName ?? `Герой ${heroId}`;
}

function errorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;

  return error ? 'Не удалось загрузить карту вардов' : null;
}

/** Matches, the selected time, and the wards standing then. */
export function useWardMap(accountId: number, matchId: number | null) {
  const detail = useDetailRun(accountId);
  const matchesQuery = useWardMatches(accountId);
  const wardsQuery = useMatchWards(accountId, matchId);
  const catalog = useCatalog();
  const [trackedMatch, setTrackedMatch] = useState(matchId);
  const [time, setTimeState] = useState(0);

  if (trackedMatch !== matchId) {
    setTrackedMatch(matchId);
    setTimeState(0);
  }

  const options = useMemo(
    () =>
      (matchesQuery.data ?? []).map((match) => ({
        matchId: match.matchId,
        label: `${formatDate(match.startTime)} · ${heroName(catalog.data, match.heroId)}`,
      })),
    [matchesQuery.data, catalog.data],
  );

  const data = wardsQuery.data;

  const bounds = useMemo(() => {
    const placed = data?.marks.map((mark) => mark.placedAt) ?? [];
    const min = placed.length > 0 ? Math.min(0, ...placed) : 0;
    return { min: Math.floor(min), max: Math.max(data?.duration ?? 0, 0) };
  }, [data]);

  const setTime = useCallback(
    (next: number) => {
      if (!Number.isFinite(next)) return;

      setTimeState(Math.min(bounds.max, Math.max(bounds.min, Math.round(next))));
    },
    [bounds.max, bounds.min],
  );

  const pins = useMemo(() => buildWardPins(data?.marks ?? [], time, catalog.data), [catalog.data, data?.marks, time]);

  async function loadMatch() {
    if (matchId == null) return;

    await detail.run([matchId], {
      start: 'Забираем разбор матча',
      done: null,
      failed: 'Не удалось забрать матч',
    });
  }

  function cancelLoad() {
    detail.cancel();
  }

  return {
    options,
    loadingMatches: matchesQuery.isLoading,
    loadingWards: matchId != null && wardsQuery.isLoading,
    error: errorMessage(wardsQuery.error) ?? errorMessage(matchesQuery.error) ?? detail.error,
    empty: !matchesQuery.isLoading && (matchesQuery.data?.length ?? 0) === 0 && !matchesQuery.error,
    parsed: data?.parsed ?? false,
    hasMarks: (data?.marks.length ?? 0) > 0,
    parsing: detail.running,
    parseStatus: detail.status,
    loadMatch,
    cancelLoad,
    time,
    min: bounds.min,
    max: bounds.max,
    clock: formatGameClock(time),
    mapImage: data?.parsed ? wardMapImage(data.startTime) : null,
    observers: pins.filter((pin) => pin.kind === 'observer').length,
    sentries: pins.filter((pin) => pin.kind === 'sentry').length,
    pins,
    setTime,
  };
}

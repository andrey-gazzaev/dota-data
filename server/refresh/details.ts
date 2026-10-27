import { isCancelled, throwIfCancelled } from '../cancel';
import { fetchJson } from '../http';
import { asRecord } from '../json';
import { asDetailRows, detailFailed } from '../merge';
import type { PlayerStore } from '../player-store';
import type { Progress } from './progress';

const BASE = 'https://api.opendota.com/api';

/** Downloads OpenDota parses for the given matches and appends each one to the detail log. */
export async function fetchMatchDetails(
  store: PlayerStore,
  userId: string,
  accountId: number,
  matchIds: readonly number[],
  emit: (event: Progress) => void,
  signal: AbortSignal,
): Promise<{ readonly fetched: number; readonly skipped: number }> {
  const stored = asDetailRows(asRecord((await store.readBundle(userId, accountId)).opendota)?.match_details);
  const good = new Set(stored.flatMap((row) => (detailFailed(row) ? [] : [row.match_id])));
  const missing = matchIds.filter((matchId) => !good.has(matchId));
  const skipped = matchIds.length - missing.length;
  if (missing.length === 0) {
    emit({ source: 'opendota', phase: 'saved', message: 'Разбор уже сохранён' });
    return { fetched: 0, skipped };
  }
  emit({ source: 'opendota', phase: 'details', message: `Разбор 0 из ${missing.length}` });
  let fetched = 0;
  for (let index = 0; index < missing.length; index += 1) {
    throwIfCancelled(signal);
    const matchId = missing[index];
    if (matchId == null) continue;
    try {
      const data = await fetchJson(`${BASE}/matches/${matchId}`, { signal });
      await store.appendDetail(userId, accountId, 'opendota', { match_id: matchId, data });
      fetched += 1;
    } catch (error) {
      if (isCancelled(error)) throw error;
      console.error(`OpenDota match ${matchId}`, error);
    }
    emit({
      source: 'opendota',
      phase: 'saved',
      message: `Разбор ${index + 1} из ${missing.length}`,
    });
  }
  return { fetched, skipped };
}

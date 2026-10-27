import type { Env } from '../env';
import { isCancelled, throwIfCancelled } from '../cancel';
import type { PlayerStore } from '../player-store';
import { refreshOpenDota } from './opendota';
import type { Progress, RefreshResult } from './progress';
import { refreshSteam } from './steam';
import { refreshStratz } from './stratz';

/** Updates every source for one account. */
export async function refreshPlayer(
  accountId: number,
  env: Env,
  userId: string,
  store: PlayerStore,
  emit: (event: Progress) => void,
  signal: AbortSignal,
): Promise<RefreshResult[]> {
  const results: RefreshResult[] = [];
  try {
    throwIfCancelled(signal);
    const message = await refreshOpenDota(store, userId, accountId, emit, signal);
    results.push({ source: 'opendota', status: 'updated', message });
  } catch (error) {
    if (isCancelled(error)) throw error;
    console.error('OpenDota refresh', error);
    const message = error instanceof Error ? error.message : 'OpenDota не ответил';
    emit({ source: 'opendota', phase: 'error', message });
    results.push({ source: 'opendota', status: 'error', message });
  }

  if (!env.steamKey) {
    const message = 'Steam пропущен: нет STEAM_API_KEY';
    emit({ source: 'steam', phase: 'skipped', message });
    results.push({ source: 'steam', status: 'skipped', message });
  } else {
    try {
      throwIfCancelled(signal);
      const message = await refreshSteam(store, userId, accountId, env.steamKey, emit, signal);
      results.push({ source: 'steam', status: 'updated', message });
    } catch (error) {
      if (isCancelled(error)) throw error;
      console.error('Steam refresh', error);
      const message = error instanceof Error ? error.message : 'Steam не ответил';
      emit({ source: 'steam', phase: 'error', message });
      results.push({ source: 'steam', status: 'error', message });
    }
  }

  if (!env.stratzKey) {
    const message = 'STRATZ пропущен: нет STRATZ_API_KEY';
    emit({ source: 'stratz', phase: 'skipped', message });
    results.push({ source: 'stratz', status: 'skipped', message });
  } else {
    try {
      throwIfCancelled(signal);
      const message = await refreshStratz(store, userId, accountId, env.stratzKey, emit, signal);
      results.push({ source: 'stratz', status: 'updated', message });
    } catch (error) {
      if (isCancelled(error)) throw error;
      console.error('STRATZ refresh', error);
      const message = error instanceof Error ? error.message : 'STRATZ не ответил';
      emit({ source: 'stratz', phase: 'error', message });
      results.push({ source: 'stratz', status: 'error', message });
    }
  }

  return results;
}

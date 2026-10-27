import { throwIfCancelled } from '../cancel';
import { fetchJson, RateLimiter } from '../http';
import type { PlayerStore } from '../player-store';
import { asArray, asNumber, asRecord, stamp } from '../json';
import { mergeById } from '../merge';
import type { Progress } from './progress';
import { beginPhase, closePhase, expectRequests } from './trace';

const OFFSET = 76561197960265728;

function emptySteam(accountId: number): Record<string, unknown> {
  return {
    account_id: accountId,
    steam_id: String(accountId + OFFSET),
    collected_at: null,
    source: 'Steam Web API (https://api.steampowered.com)',
    note: 'Official match history and unparsed match details. No medal, no replay parse. History is a short recent window, not the OpenDota archive.',
    history_status: null,
    profile: {},
    matches: [],
    match_details: [],
  };
}

/** Updates the Steam snapshot for one account. */
export async function refreshSteam(
  store: PlayerStore,
  userId: string,
  accountId: number,
  key: string,
  emit: (event: Progress) => void,
  signal: AbortSignal,
): Promise<string> {
  const existing = asRecord(await store.readSummary(userId, accountId, 'steam')) ?? emptySteam(accountId);
  const known = new Set(
    asArray(existing.matches).flatMap((row) => {
      const id = asNumber(asRecord(row)?.match_id);
      return id == null ? [] : [id];
    }),
  );
  const limiter = new RateLimiter(1050);
  const get = async (path: string, params: Record<string, string>, label: string) => {
    throwIfCancelled(signal);
    await limiter.wait(signal);
    const query = new URLSearchParams({ key, ...params });
    return fetchJson(`https://api.steampowered.com${path}?${query}`, { signal, label });
  };

  beginPhase();
  try {
    expectRequests(2);
    emit({ source: 'steam', phase: 'profile', message: 'Steam: профиль' });
    const summary = asRecord(
      await get('/ISteamUser/GetPlayerSummaries/v2/', { steamids: String(accountId + OFFSET) }, 'Steam профиль'),
    );
    const players = asArray(asRecord(summary?.response)?.players);
    const profile = asRecord(players[0]) ?? { steamid: String(accountId + OFFSET), missing: true };

    const fresh: unknown[] = [];
    const seen = new Set<number>();
    let start: number | undefined;
    let status: number | null = null;
    let reachedKnown = false;
    emit({ source: 'steam', phase: 'matches', message: 'Steam: история матчей' });
    while (true) {
      const params: Record<string, string> = { account_id: String(accountId), matches_requested: '100' };
      if (start != null) params.start_at_match_id = String(start);
      const payload = asRecord(await get('/IDOTA2Match_570/GetMatchHistory/v1/', params, 'Steam история'));
      const result = asRecord(payload?.result);
      status = asNumber(result?.status);
      if (status !== 1) break;
      const batch = asArray(result?.matches);
      for (const row of batch) {
        const id = asNumber(asRecord(row)?.match_id);
        if (id == null || seen.has(id)) continue;
        seen.add(id);
        if (known.has(id)) {
          reachedKnown = true;
          break;
        }
        fresh.push(row);
      }
      if (reachedKnown || asNumber(result?.results_remaining) === 0 || batch.length < 100) break;
      const last = asNumber(asRecord(batch.at(-1))?.match_id);
      if (last == null) break;
      start = last - 1;
      expectRequests(1);
    }

    const matches = mergeById(asArray(existing.matches), fresh, (row) => asNumber(asRecord(row)?.match_id));
    const historyOnly = status !== 1;
    await store.writeSummary(userId, accountId, 'steam', {
      ...existing,
      account_id: accountId,
      steam_id: String(accountId + OFFSET),
      collected_at: stamp(),
      source: 'Steam Web API (https://api.steampowered.com)',
      history_status: status,
      profile,
      ...(historyOnly ? {} : { matches }),
    });
    if (historyOnly) {
      const message = `Steam: история недоступна (status ${status ?? '—'})`;
      emit({ source: 'steam', phase: 'saved', message });
      return message;
    }
    emit({ source: 'steam', phase: 'saved', message: 'Steam: сводки уже на экране' });
    const windowNote = !reachedKnown && fresh.length >= 500 ? ' Steam отдаёт только последние 500 матчей.' : '';
    return `Steam: новых матчей ${fresh.length}.${windowNote}`;
  } finally {
    closePhase();
  }
}

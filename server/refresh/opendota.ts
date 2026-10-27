import { throwIfCancelled, isCancelled } from '../cancel';
import { fetchJson, openDotaRejectedKey } from '../http';
import type { PlayerStore } from '../player-store';
import { asArray, asNumber, asRecord, stamp } from '../json';
import { mergeById } from '../merge';
import type { Progress } from './progress';
import { beginPhase, closePhase, expectRequests } from './trace';

const BASE = 'https://api.opendota.com/api';
const HISTOGRAMS = [
  'kills',
  'deaths',
  'assists',
  'last_hits',
  'denies',
  'hero_damage',
  'tower_damage',
  'hero_healing',
  'gpm',
  'xpm',
  'stuns',
  'lane_efficiency_pct',
];

function emptyOpenDota(accountId: number): Record<string, unknown> {
  return {
    account_id: accountId,
    collected_at: null,
    source: 'OpenDota API (https://api.opendota.com)',
    note: 'Dotabuff has no public API; OpenDota provides equivalent match/player data from Valve replays.',
    profile: {},
    win_loss: {},
    heroes: [],
    peers: [],
    pros: [],
    totals: [],
    counts: {},
    ratings: [],
    rankings: [],
    recent_matches: [],
    wardmap: {},
    wordcloud: {},
    histograms: {},
    matches: [],
    match_details: [],
  };
}

/** Updates the OpenDota snapshot for one account. */
export async function refreshOpenDota(
  store: PlayerStore,
  userId: string,
  accountId: number,
  emit: (event: Progress) => void,
  signal: AbortSignal,
): Promise<string> {
  const existing = asRecord(await store.readSummary(userId, accountId, 'opendota')) ?? emptyOpenDota(accountId);
  const known = new Set(
    asArray(existing.matches).flatMap((row) => {
      const id = asNumber(asRecord(row)?.match_id);
      return id == null ? [] : [id];
    }),
  );
  const get = (path: string) => {
    throwIfCancelled(signal);
    return fetchJson(`${BASE}${path}`, { signal });
  };

  beginPhase();
  try {
    expectRequests(9 + HISTOGRAMS.length + 1);
    emit({ source: 'opendota', phase: 'profile', message: 'OpenDota: профиль и сводки' });
    const profile = await get(`/players/${accountId}`);
    const winLoss = await get(`/players/${accountId}/wl`);
    const heroes = await get(`/players/${accountId}/heroes`);
    const peers = await get(`/players/${accountId}/peers`);
    const totals = await get(`/players/${accountId}/totals`);
    const counts = await get(`/players/${accountId}/counts`);
    const ratings = await get(`/players/${accountId}/ratings`);
    const rankings = await get(`/players/${accountId}/rankings`);
    const recentMatches = await get(`/players/${accountId}/recentMatches`);
    const histograms: Record<string, unknown> = { ...(asRecord(existing.histograms) ?? {}) };
    for (const field of HISTOGRAMS) {
      emit({ source: 'opendota', phase: 'histogram', message: `OpenDota: гистограмма ${field}` });
      try {
        histograms[field] = await get(`/players/${accountId}/histograms/${field}`);
      } catch (error) {
        if (isCancelled(error)) throw error;
        console.error(`OpenDota histogram ${field}`, error);
      }
    }

    emit({ source: 'opendota', phase: 'matches', message: 'OpenDota: новые матчи' });
    const fresh: unknown[] = [];
    let offset = 0;
    let stop = false;
    while (!stop) {
      const batch = asArray(await get(`/players/${accountId}/matches?limit=100&offset=${offset}`));
      if (batch.length === 0) break;
      for (const row of batch) {
        const id = asNumber(asRecord(row)?.match_id);
        if (id == null) continue;
        if (known.has(id)) {
          stop = true;
          break;
        }
        fresh.push(row);
      }
      if (stop || batch.length < 100) break;
      offset += 100;
      expectRequests(1);
    }

    const matches = mergeById(asArray(existing.matches), fresh, (row) => asNumber(asRecord(row)?.match_id));
    await store.writeSummary(userId, accountId, 'opendota', {
      ...existing,
      account_id: accountId,
      collected_at: stamp(),
      source: 'OpenDota API (https://api.opendota.com)',
      profile,
      win_loss: winLoss,
      heroes,
      peers,
      totals,
      counts,
      ratings,
      rankings,
      recent_matches: recentMatches,
      histograms,
      matches,
    });
    emit({ source: 'opendota', phase: 'saved', message: 'OpenDota: сводки уже на экране' });
    const keyNote = openDotaRejectedKey() ? ' Ключ отклонён, запросы шли без него.' : '';
    return `OpenDota: новых матчей ${fresh.length}.${keyNote}`;
  } finally {
    closePhase();
  }
}

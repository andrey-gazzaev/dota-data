import { isCancelled, throwIfCancelled } from '../cancel';
import { fetchJson, RateLimiter, sleep } from '../http';
import type { PlayerStore } from '../player-store';
import { beginPhase, closePhase, expectRequests, holdRequests } from './trace';
import { asArray, asNumber, asRecord, asString, stamp } from '../json';
import { mergeById } from '../merge';
import type { Progress } from './progress';

const URL = 'https://api.stratz.com/graphql';
const PAGE = 100;
const SUMMARY_CAP = 500;

const PROFILE = `
query ($playerId: Long!) {
  player(steamAccountId: $playerId) {
    matchCount
    winCount
    firstMatchDate
    lastMatchDate
    steamAccount {
      id
      name
      avatar
      profileUri
      isAnonymous
      seasonRank
      seasonLeaderboardRank
    }
  }
}
`;

const MATCHES_BEFORE = `
query ($playerId: Long!, $take: Int!, $end: Long!) {
  player(steamAccountId: $playerId) {
    matches(request: { take: $take, skip: 0, endDateTime: $end }) {
      id
      startDateTime
      durationSeconds
      gameMode
      lobbyType
      rank
      players(steamAccountId: $playerId) {
        isRadiant
        isVictory
        kills
        deaths
        assists
        goldPerMinute
        experiencePerMinute
        networth
        heroDamage
        position
        hero { id shortName }
        item0Id
        item1Id
        item2Id
        item3Id
        item4Id
        item5Id
        neutral0Id
      }
    }
  }
}
`;

const MATCHES = `
query ($playerId: Long!, $take: Int!, $skip: Int!) {
  player(steamAccountId: $playerId) {
    matches(request: { take: $take, skip: $skip }) {
      id
      startDateTime
      durationSeconds
      gameMode
      lobbyType
      rank
      players(steamAccountId: $playerId) {
        isRadiant
        isVictory
        kills
        deaths
        assists
        goldPerMinute
        experiencePerMinute
        networth
        heroDamage
        position
        hero { id shortName }
        item0Id
        item1Id
        item2Id
        item3Id
        item4Id
        item5Id
        neutral0Id
      }
    }
  }
}
`;

function emptyStratz(accountId: number): Record<string, unknown> {
  return {
    account_id: accountId,
    collected_at: null,
    source: 'STRATZ GraphQL (https://api.stratz.com/graphql)',
    note: 'Separate replay parser from OpenDota. seasonRank is the medal. Full match parses are limited because free tokens are rate limited.',
    profile: {},
    matches: [],
    match_details: [],
  };
}

async function graphql(
  token: string,
  limiter: RateLimiter,
  query: string,
  variables: Record<string, number>,
  signal: AbortSignal,
  label: string,
): Promise<unknown> {
  let last = 'STRATZ не ответил';
  for (let attempt = 0; attempt < 5; attempt += 1) {
    throwIfCancelled(signal);
    await limiter.wait(signal);
    try {
      const payload = asRecord(
        await fetchJson(URL, {
          method: 'POST',
          signal,
          label,
          headers: {
            Authorization: `Bearer ${token}`,
            'User-Agent': 'STRATZ_API',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, variables }),
        }),
      );
      const errors = asArray(payload?.errors);
      if (errors.length > 0) {
        const message = errors.map((item) => asString(asRecord(item)?.message) ?? '').join('; ');
        if (/rate|limit/i.test(message)) {
          last = message;
          console.error('STRATZ', message);
          const pause = 15_000 + attempt * 15_000;
          expectRequests(1);
          holdRequests(pause);
          await sleep(pause, signal);
          continue;
        }
        throw new Error(message || 'STRATZ вернул ошибку');
      }
      return payload?.data;
    } catch (error) {
      if (isCancelled(error)) throw error;
      console.error('STRATZ', error);
      const message = error instanceof Error ? error.message : last;
      if (/^HTTP 4/.test(message) && !message.includes('429')) throw error;
      last = message;
      if (attempt === 4) break;
      const pause = 5_000 + attempt * 5_000;
      expectRequests(1);
      holdRequests(pause);
      await sleep(pause, signal);
    }
  }
  throw new Error(last);
}

function oldestStart(rows: unknown[]): number | null {
  let oldest: number | null = null;
  for (const row of rows) {
    const start = asNumber(asRecord(row)?.startDateTime);
    if (start == null) continue;
    if (oldest == null || start < oldest) oldest = start;
  }
  return oldest;
}

/** Updates the STRATZ snapshot for one account. */
export async function refreshStratz(
  store: PlayerStore,
  userId: string,
  accountId: number,
  token: string,
  emit: (event: Progress) => void,
  signal: AbortSignal,
): Promise<string> {
  const existing = asRecord(await store.readSummary(userId, accountId, 'stratz')) ?? emptyStratz(accountId);
  const known = new Set(
    asArray(existing.matches).flatMap((row) => {
      const id = asNumber(asRecord(row)?.id);
      return id == null ? [] : [id];
    }),
  );
  const limiter = new RateLimiter(1200);
  beginPhase();
  try {
    expectRequests(2);
    emit({ source: 'stratz', phase: 'profile', message: 'STRATZ: профиль' });
    const profile = asRecord(
      await graphql(token, limiter, PROFILE, { playerId: accountId }, signal, 'STRATZ профиль'),
    )?.player;
    if (!asRecord(profile)) throw new Error(`STRATZ не знает игрока ${accountId}`);

    const fresh: unknown[] = [];
    let backfillBefore = asNumber(existing.backfill_before);
    const page = async (query: string, variables: Record<string, number>, label: string) => {
      const data = asRecord(await graphql(token, limiter, query, variables, signal, label));
      return asArray(asRecord(data?.player)?.matches);
    };
    const takeNew = (batch: unknown[], stopOnKnown: boolean) => {
      let knownHit = false;
      for (const row of batch) {
        const id = asNumber(asRecord(row)?.id);
        if (id == null) continue;
        if (known.has(id)) {
          knownHit = true;
          if (stopOnKnown) break;
          continue;
        }
        fresh.push(row);
        known.add(id);
        if (fresh.length >= SUMMARY_CAP) break;
      }
      return knownHit;
    };

    emit({ source: 'stratz', phase: 'matches', message: 'STRATZ: новые матчи' });
    let skip = 0;
    let caughtUp = false;
    while (fresh.length < SUMMARY_CAP) {
      const take = Math.min(PAGE, SUMMARY_CAP - fresh.length);
      const batch = await page(MATCHES, { playerId: accountId, take, skip }, `STRATZ матчи ${skip}`);
      if (batch.length === 0) {
        caughtUp = true;
        break;
      }
      const knownHit = takeNew(batch, true);
      if (knownHit || batch.length < take) {
        caughtUp = true;
        break;
      }
      skip += batch.length;
      expectRequests(1);
    }

    if (caughtUp && backfillBefore != null && fresh.length < SUMMARY_CAP) {
      while (fresh.length < SUMMARY_CAP) {
        const take = Math.min(PAGE, SUMMARY_CAP - fresh.length);
        const before = fresh.length;
        const batch = await page(
          MATCHES_BEFORE,
          { playerId: accountId, take, end: backfillBefore },
          'STRATZ старые матчи',
        );
        if (batch.length === 0) {
          backfillBefore = null;
          break;
        }
        const knownHit = takeNew(batch, false);
        const added = fresh.slice(before);
        const oldest = oldestStart(added);
        if (knownHit && added.length === 0) {
          backfillBefore = null;
          break;
        }
        if (oldest == null || batch.length < take) {
          backfillBefore = null;
          break;
        }
        backfillBefore = oldest;
        expectRequests(1);
      }
    } else if (!caughtUp) {
      backfillBefore = oldestStart(fresh);
    }

    const matches = mergeById(asArray(existing.matches), fresh, (row) => asNumber(asRecord(row)?.id));
    const summary: Record<string, unknown> = {
      ...existing,
      account_id: accountId,
      collected_at: stamp(),
      source: 'STRATZ GraphQL (https://api.stratz.com/graphql)',
      profile,
      matches,
    };
    if (backfillBefore == null) delete summary.backfill_before;
    else summary.backfill_before = backfillBefore;
    await store.writeSummary(userId, accountId, 'stratz', summary);
    emit({ source: 'stratz', phase: 'saved', message: 'STRATZ: сводки уже на экране' });
    const tail = backfillBefore != null ? ' Следующее обновление заберёт более старые матчи.' : '';
    return `STRATZ: новых матчей ${fresh.length}.${tail}`;
  } finally {
    closePhase();
  }
}

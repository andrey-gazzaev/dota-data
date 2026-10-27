import path from 'node:path';
import { cacheDir, ensureDir, readJson, writeJson } from './files';
import { fetchJson, RateLimiter } from './http';
import { asArray, asNumber, asRecord } from './json';

const URL = 'https://api.stratz.com/graphql';
const DAY = 24 * 60 * 60 * 1000;
const limiter = new RateLimiter(1_200);
const inflight = new Map<string, Promise<HeroMetaEntry[]>>();

const QUERY = `query($brackets: [RankBracketBasicEnum!]) {
  heroStats {
    matchUp(bracketBasicIds: $brackets, take: 200) {
      heroId
      vs { heroId2 matchCount winCount }
      with { heroId2 matchCount winCount }
    }
  }
}`;

/** Rank groups used for hero counters and synergies. */
export const META_BRACKETS = ['HERALD_GUARDIAN', 'CRUSADER_ARCHON', 'LEGEND_ANCIENT', 'DIVINE_IMMORTAL'] as const;

/** One rank group for hero counters and synergies. */
export type MetaBracket = (typeof META_BRACKETS)[number];

/** Games and wins with or against one hero. */
export type HeroPair = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Matches in the pair. */
  readonly games: number;

  /** Wins for the hero this row is about. */
  readonly wins: number;
};

/** Counters and synergies for one hero. */
export type HeroMetaRows = {
  /** Heroes that beat this hero. */
  readonly counters: HeroPair[];

  /** Heroes that win with this hero. */
  readonly synergies: HeroPair[];
};

/** Counters and synergies for one hero in a rank batch. */
export type HeroMetaEntry = HeroMetaRows & {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;
};

const EMPTY_ROWS: HeroMetaRows = { counters: [], synergies: [] };

/** Counters and synergies for every hero STRATZ returned. Heroes without pairs are left out. */
export function mapHeroMetas(payload: unknown): HeroMetaEntry[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const stats = asRecord(data?.heroStats);
  return asArray(stats?.matchUp).flatMap((entry) => {
    const row = asRecord(entry);
    const heroId = asNumber(row?.heroId);
    if (!row || heroId == null || heroId <= 0) return [];
    const counters = pairs(row.vs);
    const synergies = pairs(row.with);
    if (counters.length === 0 && synergies.length === 0) return [];
    return [{ heroId, counters, synergies }];
  });
}

/** Counters and synergies for every hero at one rank. */
export async function loadHeroMetas(
  root: string,
  token: string | null,
  bracket: MetaBracket | null,
): Promise<HeroMetaEntry[]> {
  const key = `${root}:${bracket ?? 'all'}`;
  const file = path.join(cacheDir(root), cacheName(bracket));
  const cached = readCached(readJson(file), bracket);
  if (cached) return cached;
  const running = inflight.get(key);
  if (running) return running;
  const request = fetchMetas(root, file, token, bracket);
  inflight.set(key, request);
  try {
    return await request;
  } finally {
    inflight.delete(key);
  }
}

/** Counters and synergies for one hero at one rank. Empty when that hero has no pairs. */
export async function loadHeroMeta(
  root: string,
  heroId: number,
  token: string | null,
  bracket: MetaBracket | null,
): Promise<HeroMetaRows> {
  const heroes = await loadHeroMetas(root, token, bracket);
  const found = heroes.find((hero) => hero.heroId === heroId);
  if (!found) return EMPTY_ROWS;
  return { counters: found.counters, synergies: found.synergies };
}

async function fetchMetas(
  root: string,
  file: string,
  token: string | null,
  bracket: MetaBracket | null,
): Promise<HeroMetaEntry[]> {
  if (!token) throw new Error('Нет ключа STRATZ, общая статистика недоступна');
  await limiter.wait();
  const payload = await fetchJson(URL, {
    method: 'POST',
    label: 'STRATZ мета героев',
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'STRATZ_API',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { brackets: bracket ? [bracket] : null },
    }),
  });
  const errors = asArray(asRecord(payload)?.errors);
  if (errors.length > 0) {
    const message = errors.map((item) => asRecord(item)?.message).find((item) => typeof item === 'string');
    throw new Error(typeof message === 'string' ? message : 'STRATZ не отдал мету героев');
  }
  const heroes = mapHeroMetas(payload);
  if (heroes.length === 0) throw new Error('STRATZ не отдал пары героев');
  ensureDir(cacheDir(root));
  writeJson(file, { savedAt: Date.now(), bracket: bracket ?? 'all', heroes });
  return heroes;
}

function cacheName(bracket: MetaBracket | null): string {
  return bracket ? `heroes_meta_${bracket}.json` : 'heroes_meta.json';
}

function readCached(value: unknown, bracket: MetaBracket | null): HeroMetaEntry[] | null {
  const cached = asRecord(value);
  const savedAt = asNumber(cached?.savedAt);
  if (!cached || savedAt == null || Date.now() - savedAt >= DAY) return null;
  const stored = typeof cached.bracket === 'string' ? cached.bracket : null;
  if (stored !== (bracket ?? 'all')) return null;
  const heroes = storedHeroes(cached.heroes);
  if (heroes.length === 0) return null;
  return heroes;
}

function storedHeroes(value: unknown): HeroMetaEntry[] {
  return asArray(value).flatMap((entry) => {
    const row = asRecord(entry);
    const heroId = asNumber(row?.heroId);
    if (!row || heroId == null || heroId <= 0) return [];
    const counters = storedPairs(row.counters);
    const synergies = storedPairs(row.synergies);
    if (counters.length === 0 && synergies.length === 0) return [];
    return [{ heroId, counters, synergies }];
  });
}

function storedPairs(value: unknown): HeroPair[] {
  return asArray(value).flatMap((entry) => {
    const row = asRecord(entry);
    const id = asNumber(row?.heroId);
    const games = asNumber(row?.games);
    const wins = asNumber(row?.wins);
    if (!row || id == null || games == null || wins == null || games <= 0) return [];
    return [{ heroId: id, games, wins }];
  });
}

function pairs(value: unknown): HeroPair[] {
  return asArray(value).flatMap((entry) => {
    const row = asRecord(entry);
    const heroId = asNumber(row?.heroId2);
    const games = asNumber(row?.matchCount);
    const wins = asNumber(row?.winCount);
    if (!row || heroId == null || heroId <= 0 || games == null || wins == null || games <= 0) return [];
    return [{ heroId, games, wins }];
  });
}

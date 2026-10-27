import { timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express';
import { MongoClient } from 'mongodb';
import { Accounts } from './accounts';
import { isCancelled } from './cancel';
import { clearSessionCookie, readCookie, SESSION_COOKIE, sessionCookie } from './cookies';
import { readEnv } from './env';
import { normalizeLogin } from './login';
import { MongoStore } from './mongo-store';
import { fetchMatchDetails } from './refresh/details';
import { knownMatchIds, listOpenDotaSummaries, RECENT_MATCH_LIMIT } from './summaries';
import { fetchJson } from './http';
import { asArray, asNumber, asRecord, asString } from './json';
import { projectPerformances, projectSnapshot, type Snapshot } from './project';
import { loadHeroMeta, loadHeroMetas, META_BRACKETS, type MetaBracket } from './meta';
import { loadConstants, loadMatchups } from './reference';
import { refreshPlayer } from './refresh/run';
import { withRequestTrace } from './refresh/trace';
import { listWardMatches, readMatchWards } from './wards';

const env = readEnv();
const running = new Set<string>();
const jobs = new Map<string, AbortController>();
const app = express();
let store: MongoStore | null = null;
let accounts: Accounts | null = null;

function records(): MongoStore {
  if (!store) throw new Error('База ещё не готова');
  return store;
}

function people(): Accounts {
  if (!accounts) throw new Error('База ещё не готова');
  return accounts;
}

const owners = new WeakMap<Request, string>();

function setUser(request: Request, id: string): void {
  owners.set(request, id);
}

function userId(request: Request): string {
  const id = owners.get(request);
  if (!id) throw new Error('Нет пользователя');
  return id;
}

function jobKey(owner: string, account: number): string {
  return `${owner}:${account}`;
}

app.use(express.json({ limit: '32kb' }));

app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

function sendJson(response: Response, status: number, body: unknown): void {
  response.status(status).set('Cache-Control', 'no-store').json(body);
}

function requirePassword(request: Request, response: Response, next: NextFunction): void {
  if (process.env.NODE_ENV !== 'production' || !env.password) {
    next();
    return;
  }
  const expected = Buffer.from(Buffer.from(`guest:${env.password}`).toString('base64'));
  const header = request.headers.authorization ?? '';
  const given = Buffer.from(header.startsWith('Basic ') ? header.slice('Basic '.length).trim() : '');
  if (given.length === expected.length && timingSafeEqual(given, expected)) {
    next();
    return;
  }
  response.setHeader('WWW-Authenticate', 'Basic realm="dota-data"');
  sendJson(response, 401, { message: 'Нужен пароль' });
}

function resolveClientDir(): string | null {
  const bundled = path.join(path.dirname(fileURLToPath(import.meta.url)), 'client');
  const built = path.join(process.cwd(), 'dist', 'client');
  const configured = process.env.CLIENT_DIR?.trim();
  const candidates = [configured, bundled, built].filter((dir): dir is string => Boolean(dir));
  return candidates.find((dir) => existsSync(path.join(dir, 'index.html'))) ?? null;
}

function serveClient(): void {
  const clientDir = resolveClientDir();
  if (!clientDir) return;
  app.use(express.static(clientDir, { index: 'index.html', maxAge: '1h' }));
  app.get(/^\/(?!api(?:\/|$)).*/, (_request, response, next) => {
    response.setHeader('Cache-Control', 'no-cache');
    response.sendFile(path.join(clientDir, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

function accountId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

function routeId(value: string | string[] | undefined): number | null {
  return accountId(Array.isArray(value) ? value[0] : value);
}

function requestedBracket(value: unknown): MetaBracket | null | undefined {
  const raw = typeof value === 'string' ? value : '';
  if (!raw) return null;
  return META_BRACKETS.find((item) => item === raw);
}

function requestedMatchIds(body: unknown): number[] | null {
  const values = asRecord(body)?.matchIds;
  if (!Array.isArray(values) || values.length === 0 || values.length > RECENT_MATCH_LIMIT) return null;
  const ids: number[] = [];
  for (const value of values) {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) return null;
    ids.push(value);
  }
  return ids;
}

async function streamJob(
  response: Response,
  key: string,
  cancelledMessage: string,
  run: (send: (event: string, data: unknown) => void, signal: AbortSignal) => Promise<void>,
): Promise<void> {
  if (running.has(key)) {
    sendJson(response, 409, { message: 'Обновление этого игрока уже идёт' });
    return;
  }
  const controller = new AbortController();
  running.add(key);
  jobs.set(key, controller);
  response.status(200);
  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');
  response.flushHeaders();
  let settled = false;
  const send = (event: string, data: unknown) => {
    if (settled || response.writableEnded) return;
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };
  response.on('close', () => {
    if (!settled) controller.abort();
  });
  try {
    await run(send, controller.signal);
  } catch (error) {
    if (isCancelled(error)) {
      console.error(`${cancelledMessage} ${key}`);
      send('cancelled', { message: cancelledMessage });
    } else {
      console.error(cancelledMessage, key, error);
      send('error', { message: error instanceof Error ? error.message : 'Запрос прервался' });
    }
  } finally {
    settled = true;
    jobs.delete(key);
    running.delete(key);
    if (!response.writableEnded) response.end();
  }
}

async function refresh(response: Response, owner: string, id: number): Promise<void> {
  await streamJob(response, jobKey(owner, id), 'Обновление отменено', async (send, signal) => {
    const results = await withRequestTrace(
      {
        onLog: (entry) => send('log', entry),
        onEstimate: (entry) => send('estimate', entry),
      },
      () => refreshPlayer(id, env, owner, records(), (event) => send('progress', event), signal),
    );
    send('done', { results });
  });
}

app.get('/api/health', (_request, response) => {
  sendJson(response, 200, { ok: true });
});

app.use(requirePassword);

app.get('/api/session', async (request, response) => {
  const user = await people().findSession(readCookie(request.headers.cookie, SESSION_COOKIE));
  sendJson(response, 200, { user: user ? { login: user.login } : null });
});

app.post('/api/session', async (request, response) => {
  const login = normalizeLogin(asString(asRecord(request.body)?.login) ?? '');
  if (!login) return sendJson(response, 400, { message: 'Введите email или логин' });
  const session = await people().enter(login);
  response.setHeader('Set-Cookie', sessionCookie(session.token));
  sendJson(response, 200, { user: { login: session.login } });
});

app.delete('/api/session', async (request, response) => {
  await people().leave(readCookie(request.headers.cookie, SESSION_COOKIE));
  response.setHeader('Set-Cookie', clearSessionCookie());
  sendJson(response, 200, { ok: true });
});

async function requireUser(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const user = await people().findSession(readCookie(request.headers.cookie, SESSION_COOKIE));
    if (!user) {
      sendJson(response, 401, { message: 'Войдите, чтобы открыть свои данные' });
      return;
    }
    setUser(request, user.userId);
    next();
  } catch (error) {
    next(error);
  }
}

app.use(requireUser);

app.get('/api/players', async (request, response) => {
  sendJson(response, 200, { players: await records().listPlayers(userId(request)) });
});

app.get('/api/players/:id', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bundle = await records().readBundle(userId(request), id);
  sendJson(response, 200, await withRemoteIdentity(id, projectSnapshot(id, bundle)));
});

app.get('/api/players/:id/performances', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bundle = await records().readBundle(userId(request), id);
  sendJson(response, 200, { rows: projectPerformances(id, bundle) });
});

app.get('/api/players/:id/summaries', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bundle = await records().readBundle(userId(request), id);
  sendJson(response, 200, { matches: listOpenDotaSummaries(bundle.opendota) });
});

app.post('/api/players/:id/details', async (request, response) => {
  const id = routeId(request.params.id);
  const matchIds = requestedMatchIds(request.body);
  if (id == null || matchIds == null) return sendJson(response, 400, { message: 'Некорректный запрос' });
  const owner = userId(request);
  const known = knownMatchIds(await records().readBundle(owner, id));
  if (matchIds.some((matchId) => !known.has(matchId))) {
    return sendJson(response, 400, { message: 'Матч не найден в локальных сводках' });
  }
  await streamJob(response, jobKey(owner, id), 'Разбор отменён', async (send, signal) => {
    const result = await fetchMatchDetails(records(), owner, id, matchIds, (event) => send('progress', event), signal);
    send('done', result);
  });
});

app.delete('/api/players/:id/details', (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  jobs.get(jobKey(userId(request), id))?.abort();
  sendJson(response, 200, { cancelled: true });
});

app.get('/api/players/:id/ward-matches', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bundle = await records().readBundle(userId(request), id);
  sendJson(response, 200, { matches: listWardMatches(bundle.opendota, id) });
});

app.get('/api/players/:id/matches/:matchId/wards', async (request, response) => {
  const id = routeId(request.params.id);
  const matchId = routeId(request.params.matchId);
  if (id == null || matchId == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bundle = await records().readBundle(userId(request), id);
  const known = listOpenDotaSummaries(bundle.opendota).some((match) => match.matchId === matchId);
  const wards = readMatchWards(bundle.opendota, matchId);
  if (!known && !wards.parsed) return sendJson(response, 404, { message: 'Матч не найден в локальных сводках' });
  sendJson(response, 200, wards);
});

app.delete('/api/players/:id/refresh', (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  jobs.get(jobKey(userId(request), id))?.abort();
  sendJson(response, 200, { cancelled: true });
});

app.post('/api/players/:id/refresh', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  await refresh(response, userId(request), id);
});

app.get('/api/search', async (request, response) => {
  const query = typeof request.query.q === 'string' ? request.query.q.trim() : '';
  if (!query) return sendJson(response, 400, { message: 'Пустой запрос' });
  sendJson(response, 200, { players: await searchPlayers(query) });
});

app.get('/api/constants', async (_request, response) => {
  sendJson(response, 200, await loadConstants(env.root));
});

app.get('/api/heroes/:id/matchups', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  sendJson(response, 200, { heroId: id, matchups: await loadMatchups(env.root, id) });
});

app.get('/api/heroes/meta', async (request, response) => {
  const bracket = requestedBracket(request.query.bracket);
  if (bracket === undefined) return sendJson(response, 400, { message: 'Некорректный ранг' });
  const heroes = await loadHeroMetas(env.root, env.stratzKey, bracket);
  sendJson(response, 200, { heroes });
});

app.get('/api/heroes/:id/meta', async (request, response) => {
  const id = routeId(request.params.id);
  if (id == null) return sendJson(response, 400, { message: 'Некорректный id' });
  const bracket = requestedBracket(request.query.bracket);
  if (bracket === undefined) return sendJson(response, 400, { message: 'Некорректный ранг' });
  const meta = await loadHeroMeta(env.root, id, env.stratzKey, bracket);
  sendJson(response, 200, { heroId: id, counters: meta.counters, synergies: meta.synergies });
});

serveClient();

const reportError: ErrorRequestHandler = (error, request, response, next) => {
  console.error(request.method, request.path, error);
  if (response.headersSent) {
    next(error);
    return;
  }
  const message = error instanceof Error ? error.message : 'Ошибка сервера';
  response.status(502).json({ message });
};
app.use(reportError);

async function searchPlayers(query: string): Promise<
  {
    readonly accountId: number;
    readonly personaName: string;
    readonly avatarUrl: string | null;
    readonly lastMatchTime: number | null;
  }[]
> {
  if (/^\d+$/.test(query)) {
    const payload = asRecord(await fetchJson(`https://api.opendota.com/api/players/${query}`));
    const profile = asRecord(payload?.profile);
    const accountId = asNumber(profile?.account_id) ?? asNumber(query);
    const name = asString(profile?.personaname);
    if (accountId == null || !name) return [];
    return [
      {
        accountId,
        personaName: name,
        avatarUrl: asString(profile?.avatarfull),
        lastMatchTime: null,
      },
    ];
  }
  const payload = await fetchJson(`https://api.opendota.com/api/search?q=${encodeURIComponent(query)}`);
  return asArray(payload).flatMap((entry) => {
    const row = asRecord(entry);
    const accountId = asNumber(row?.account_id);
    if (!row || accountId == null) return [];
    return [
      {
        accountId,
        personaName: asString(row.personaname) ?? `Игрок ${accountId}`,
        avatarUrl: asString(row.avatarfull),
        lastMatchTime: asNumber(row.last_match_time),
      },
    ];
  });
}

async function withRemoteIdentity(accountId: number, snapshot: Snapshot): Promise<Snapshot> {
  if (snapshot.hasLocalData) return snapshot;
  try {
    const payload = asRecord(await fetchJson(`https://api.opendota.com/api/players/${accountId}`));
    const profile = asRecord(payload?.profile);
    const name = asString(profile?.personaname);
    if (!payload || !name) return snapshot;
    return {
      ...snapshot,
      personaName: name,
      avatarUrl: asString(profile?.avatarfull),
      profileUrl: asString(profile?.profileurl),
      rankTier: asNumber(payload.rank_tier),
      leaderboardRank: asNumber(payload.leaderboard_rank),
      computedMmr: asNumber(payload.computed_mmr),
    };
  } catch (error) {
    console.error(`OpenDota profile ${accountId}`, error);
    return snapshot;
  }
}

const host = process.env.HOST?.trim() || '0.0.0.0';
const port = Number(process.env.PORT ?? 8787);

async function main(): Promise<void> {
  const client = new MongoClient(env.mongoUri, { serverSelectionTimeoutMS: 8_000 });
  await client.connect();
  const db = client.db();
  store = new MongoStore(db);
  accounts = new Accounts(db, store);
  await store.ensureIndexes();
  await accounts.ensureIndexes();
  const imported = await store.importLocalFiles(env.root);
  if (imported > 0) console.log(`В MongoDB перенесено источников: ${imported}`);

  const server = app.listen(port, host, () => {
    console.log(`API http://${host}:${port}`);
  });

  function shutdown(): void {
    server.close(() => {
      void client.close().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 5_000).unref();
  }

  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});

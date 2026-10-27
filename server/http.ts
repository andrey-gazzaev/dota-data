import { RefreshCancelled, isCancelled } from './cancel';
import { holdRequests, traceBegin, traceFinish } from './refresh/trace';

/** Waits, and stops early when the caller cancels. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new RefreshCancelled());
  return new Promise((resolve, reject) => {
    const timer = setTimeout(finish, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new RefreshCancelled());
    };
    function finish() {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/** Keeps a gap between outbound requests. */
export class RateLimiter {
  private next = 0;
  private blockedUntil = 0;

  /** Minimum gap between requests, in milliseconds. */
  public constructor(private readonly gapMs: number) {}

  /** Waits until the next request is allowed. */
  public async wait(signal?: AbortSignal): Promise<void> {
    await this.waitUntilUnblocked(signal);
    const now = Date.now();
    const at = Math.max(now, this.next);
    this.next = at + this.gapMs;
    if (at > now) await sleep(at - now, signal);
    await this.waitUntilUnblocked(signal);
  }

  /** Pushes the next request further out. */
  public postpone(ms: number): void {
    this.blockedUntil = Math.max(this.blockedUntil, Date.now() + ms);
  }

  private async waitUntilUnblocked(signal?: AbortSignal): Promise<void> {
    while (Date.now() < this.blockedUntil) {
      await sleep(this.blockedUntil - Date.now(), signal);
    }
  }
}

const openDota = new RateLimiter(1_200);
let openDotaKeyRejected = false;

/** True when later OpenDota calls go without an API key. */
export function openDotaRejectedKey(): boolean {
  return openDotaKeyRejected;
}

/** Clears the remembered OpenDota key refusal. Used by tests. */
export function resetOpenDotaAuthForTests(): void {
  openDotaKeyRejected = false;
}

/** How long to wait after the remote asks us to slow down. */
export function rateLimitPauseMs(retryAfter: string | null): number {
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, 120_000);
  return 60_000;
}

/** Options for an outbound request, with a short label for the log. */
export type FetchOptions = RequestInit & {
  /** Short name shown in the progress log. Absent when the URL is shown instead. */
  readonly label?: string;
};

/** Short name of a request for the progress log. */
export function displayTarget(url: string, label?: string): string {
  if (label) return label;
  const clean = redactUrl(url);
  try {
    const parsed = new URL(clean);
    const params = new URLSearchParams(parsed.search);
    params.delete('key');
    params.delete('api_key');
    const search = params.toString();
    const path = `${parsed.pathname}${search ? `?${search}` : ''}`;
    if (parsed.hostname.includes('opendota')) return `OpenDota ${path.replace(/^\/api/, '')}`;
    if (parsed.hostname.includes('steampowered')) return `Steam ${path}`;
    return `${parsed.hostname}${path}`;
  } catch {
    return clean;
  }
}

/** JSON from a remote URL. */
export async function fetchJson(url: string, init?: FetchOptions): Promise<unknown> {
  const { label, ...rest } = init ?? {};
  const caller = rest.signal ?? undefined;
  const method = (rest.method ?? 'GET').toUpperCase();
  const isOpenDota = url.startsWith('https://api.opendota.com');
  let last = 'запрос не удался';
  const attempts = isOpenDota ? 6 : 4;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (caller?.aborted) throw new RefreshCancelled();
    let traced = false;
    let traceId: number | null = null;
    const started = Date.now();
    const finish = (status: number | null, counts: boolean, note: string | null) => {
      if (traced) return;
      traced = true;
      traceFinish(traceId, status, Date.now() - started, counts, note);
    };
    const target = openDotaRequestUrl(url);
    const shown = displayTarget(target, label);
    try {
      if (isOpenDota) await openDota.wait(caller);
      traceId = traceBegin(method, shown);
      const response = await fetch(target, {
        ...rest,
        headers: { Accept: 'application/json', 'User-Agent': 'dota-data/1.0', ...rest.headers },
        signal: caller ? AbortSignal.any([caller, AbortSignal.timeout(40_000)]) : AbortSignal.timeout(40_000),
      });
      if (response.status === 429) {
        const pause = rateLimitPauseMs(response.headers.get('retry-after'));
        openDota.postpone(pause);
        last = `HTTP 429`;
        console.error(redactUrl(target), `HTTP 429, пауза ${Math.round(pause / 1000)} с`);
        finish(429, false, null);
        holdRequests(pause);
        await sleep(pause, caller);
        continue;
      }
      if (response.status >= 500) {
        last = `HTTP ${response.status}`;
        console.error(redactUrl(target), last);
        const finalAttempt = attempt === attempts - 1;
        finish(response.status, finalAttempt, null);
        if (finalAttempt) break;
        const pause = 1500 + attempt * 2500;
        holdRequests(pause);
        await sleep(pause, caller);
        continue;
      }
      const text = await response.text();
      if (isOpenDota && response.status === 400 && text.includes('API key invalid') && !openDotaKeyRejected) {
        openDotaKeyRejected = true;
        delete process.env.OPENDOTA_API_KEY;
        console.error('OpenDota отклонил API-ключ, повтор без ключа');
        finish(400, false, 'ключ отклонён');
        continue;
      }
      if (!response.ok) {
        finish(response.status, true, null);
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 180)}`);
      }
      finish(response.status, true, null);
      if (!text) return null;
      return JSON.parse(text) as unknown;
    } catch (error) {
      if (isCancelled(error) || caller?.aborted) {
        finish(null, false, 'отменён');
        throw new RefreshCancelled();
      }
      console.error(redactUrl(target), error);
      if (error instanceof Error && /^HTTP [0-9]/.test(error.message) && !error.message.includes('429')) {
        finish(null, true, error.message.slice(0, 80));
        throw error;
      }
      last = error instanceof Error ? error.message : last;
      const finalAttempt = attempt === attempts - 1;
      finish(null, finalAttempt, error instanceof Error && error.name === 'TimeoutError' ? 'таймаут' : 'ошибка');
      if (finalAttempt) break;
      const pause = 1500 + attempt * 2500;
      holdRequests(pause);
      await sleep(pause, caller);
    }
  }
  if (caller?.aborted) throw new RefreshCancelled();
  throw new Error(last);
}

function openDotaRequestUrl(url: string): string {
  if (!url.startsWith('https://api.opendota.com')) return url;
  const base = url
    .replace(/([?&])api_key=[^&]*/g, '$1')
    .replace(/[?&]$/, '')
    .replace('?&', '?');
  if (openDotaKeyRejected) return base;
  const key = process.env.OPENDOTA_API_KEY?.trim();
  if (!key) return base;
  const join = base.includes('?') ? '&' : '?';
  return `${base}${join}api_key=${encodeURIComponent(key)}`;
}

function redactUrl(url: string): string {
  return url.replace(/([?&](?:key|api_key)=)[^&]*/g, '$1***');
}

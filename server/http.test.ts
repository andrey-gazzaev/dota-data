import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  displayTarget,
  fetchJson,
  openDotaRejectedKey,
  rateLimitPauseMs,
  resetOpenDotaAuthForTests,
  sleep,
} from './http';

describe('rateLimitPauseMs', () => {
  it('waits a full minute when OpenDota does not say how long', () => {
    expect(rateLimitPauseMs(null)).toBe(60_000);
  });

  it('uses Retry-After when OpenDota sends it', () => {
    expect(rateLimitPauseMs('15')).toBe(15_000);
  });
});

describe('displayTarget', () => {
  it('hides API keys and keeps the OpenDota path', () => {
    expect(displayTarget('https://api.opendota.com/api/matches/15?api_key=secret')).toBe('OpenDota /matches/15');
    expect(
      displayTarget('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=secret', 'Steam профиль'),
    ).toBe('Steam профиль');
  });
});

describe('fetchJson', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetOpenDotaAuthForTests();
    delete process.env.OPENDOTA_API_KEY;
  });

  it('drops a rejected OpenDota key and retries the same call without it', async () => {
    process.env.OPENDOTA_API_KEY = 'rejected-key';
    const urls: string[] = [];
    vi.stubGlobal('fetch', (url: string) => {
      urls.push(url);
      if (url.includes('api_key=')) {
        return Promise.resolve(
          new Response('{"error":"API key invalid. Please check the API dashboard."}', { status: 400 }),
        );
      }
      return Promise.resolve(new Response('{"ok":true}', { status: 200 }));
    });
    await expect(fetchJson('https://api.opendota.com/api/health')).resolves.toEqual({ ok: true });
    expect(openDotaRejectedKey()).toBe(true);
    expect(urls[0]).toContain('api_key=');
    expect(urls[1]).not.toContain('api_key=');
  });
});

describe('sleep', () => {
  it('rejects as soon as the refresh is cancelled', async () => {
    const controller = new AbortController();
    const pending = sleep(60_000, controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'RefreshCancelled' });
  });
});

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { importLocalPlayers } from './import-files';
import { MemoryStore } from './memory-store';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function root(): string {
  const dir = mkdtempSync(path.join(tmpdir(), 'dota-import-'));
  roots.push(dir);
  return dir;
}

describe('memory store', () => {
  it('keeps the first successful parse and leaves match details out of the summary', async () => {
    const store = new MemoryStore();
    await store.writeSummary('owner', 5, 'opendota', {
      account_id: 5,
      profile: { profile: { personaname: 'Ace' } },
      matches: [{ match_id: 1 }, { match_id: 2 }],
      match_details: [{ match_id: 9, data: { players: [{ account_id: 5 }] } }],
    });
    await store.appendDetail('owner', 5, 'opendota', {
      match_id: 2,
      data: { players: [{ account_id: 5, hero_id: 3 }] },
    });
    await store.appendDetail('owner', 5, 'opendota', {
      match_id: 2,
      data: { players: [{ account_id: 5, hero_id: 4 }] },
    });

    const summary = store.readSummary('owner', 5, 'opendota');
    await expect(summary).resolves.not.toHaveProperty('match_details');
    const stored = (await store.readBundle('owner', 5)).opendota as {
      readonly matches: { readonly match_id: number }[];
      readonly match_details: {
        readonly match_id: number;
        readonly data: { readonly players: { readonly hero_id?: number }[] };
      }[];
    };
    expect(stored.matches.map((row) => row.match_id)).toEqual([1, 2]);
    expect(stored.match_details).toHaveLength(1);
    expect(stored.match_details[0]?.data.players[0]?.hero_id).toBe(3);
    await expect(store.listPlayers('owner')).resolves.toEqual([
      { accountId: 5, personaName: 'Ace', sources: ['opendota'] },
    ]);
  });
});

describe('import local players', () => {
  it('copies summary files and the detail log, then gives them to the first account', async () => {
    const dir = root();
    writeFileSync(
      path.join(dir, 'player_5_opendota.json'),
      JSON.stringify({
        account_id: 5,
        matches: [{ match_id: 1 }],
        match_details: [{ match_id: 1, data: { players: [{ account_id: 5 }] } }],
      }),
    );
    writeFileSync(
      path.join(dir, 'player_5_opendota.summary.json'),
      JSON.stringify({
        account_id: 5,
        profile: { profile: { personaname: 'Ace' } },
        matches: [{ match_id: 1 }, { match_id: 2 }],
      }),
    );
    writeFileSync(
      path.join(dir, 'player_5_opendota.details.jsonl'),
      `${JSON.stringify({ match_id: 2, data: { players: [{ account_id: 5, hero_id: 3 }] } })}\n`,
    );

    const store = new MemoryStore();
    await expect(importLocalPlayers(dir, store)).resolves.toBe(1);
    await expect(store.listPlayers('owner')).resolves.toEqual([]);
    await store.claimUnowned('owner');

    const stored = (await store.readBundle('owner', 5)).opendota as {
      readonly matches: { readonly match_id: number }[];
      readonly match_details: { readonly match_id: number }[];
    };
    expect(stored.matches.map((row) => row.match_id)).toEqual([1, 2]);
    expect(stored.match_details.map((row) => row.match_id).sort()).toEqual([1, 2]);
    await expect(store.listPlayers('owner')).resolves.toEqual([
      { accountId: 5, personaName: 'Ace', sources: ['opendota'] },
    ]);
    await expect(store.readSummary('owner', 5, 'opendota')).resolves.not.toHaveProperty('match_details');
  });
});

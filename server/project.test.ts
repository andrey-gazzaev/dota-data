import { describe, expect, it } from 'vitest';
import { projectPerformances, projectSnapshot } from './project';

const opendota = {
  account_id: 5,
  collected_at: '2026-09-25T00:00:00Z',
  win_loss: { win: 1, lose: 1 },
  heroes: [{ hero_id: 1, games: 2, win: 1, last_played: 10 }],
  histograms: {
    gpm: [{ x: 400, games: 2, win: 1 }],
    deaths: [{ x: 2, games: 4, win: 1 }],
    kills: [{ x: 5, games: 3, win: 2 }],
    assists: [{ x: 10, games: 2, win: 2 }],
    tower_damage: [{ x: 0, games: 5, win: 1 }],
  },
  recent_matches: [{ match_id: 8, tower_damage: 900, hero_damage: 4000, gold_per_min: 410 }],
  profile: {
    rank_tier: 32,
    computed_mmr: 1000,
    leaderboard_rank: null,
    profile: { personaname: 'Anshef', avatarfull: 'https://avatar', profileurl: 'https://profile', account_id: 5 },
  },
  matches: [
    {
      match_id: 9,
      player_slot: 0,
      radiant_win: true,
      hero_id: 2,
      start_time: 20,
      duration: 100,
      kills: 1,
      deaths: 2,
      assists: 3,
    },
    {
      match_id: 8,
      player_slot: 132,
      radiant_win: true,
      hero_id: 3,
      start_time: 5,
      duration: 80,
      kills: 0,
      deaths: 1,
      assists: 2,
    },
  ],
  match_details: [
    {
      match_id: 9,
      data: {
        start_time: 20,
        duration: 100,
        radiant_win: true,
        players: [
          {
            account_id: 5,
            hero_id: 1,
            isRadiant: true,
            win: 1,
            player_slot: 0,
            kills: 3,
            deaths: 1,
            assists: 4,
            gold_per_min: 500,
            xp_per_min: 600,
            tower_damage: 2600,
            hero_damage: 18000,
            last_hits: 120,
            item_0: 11,
            item_1: 0,
            item_2: 22,
            item_3: 0,
            item_4: 0,
            item_5: 0,
            item_neutral: 0,
            purchase_log: [
              { time: 55, key: 'circlet' },
              { time: -89, key: 'tango' },
              { time: -89, key: '' },
            ],
          },
          {
            account_id: 6,
            hero_id: 4,
            isRadiant: true,
            player_slot: 1,
            kills: 2,
            deaths: 3,
            assists: 4,
          },
          { account_id: 8, hero_id: 7, isRadiant: false, player_slot: 128, kills: 9, deaths: 1, assists: 0 },
        ],
      },
    },
    { match_id: 8, data: { error: 'fetch failed' } },
  ],
};

describe('project snapshot and performances', () => {
  it('reads the player row, enemies and a summary when the detail failed', () => {
    const rows = projectPerformances(5, { opendota, steam: null, stratz: null });
    const detailed = rows.find((row) => row.matchId === 9);
    const summary = rows.find((row) => row.matchId === 8);
    expect(detailed).toMatchObject({
      source: 'opendota',
      heroId: 1,
      win: true,
      items: [11, 0, 22, 0, 0, 0],
      neutralItem: null,
      purchases: ['tango', 'circlet'],
      enemyHeroIds: [7],
      allies: [{ heroId: 4, kills: 2, deaths: 3, assists: 4 }],
      enemies: [{ heroId: 7, kills: 9, deaths: 1, assists: 0 }],
      goldPerMin: 500,
      towerDamage: 2600,
      heroDamage: 18000,
      lastHits: 120,
    });
    expect(summary).toMatchObject({
      heroId: 3,
      win: false,
      items: [],
      enemyHeroIds: [],
      towerDamage: 900,
      heroDamage: 4000,
      goldPerMin: 410,
    });
  });

  it('maps OpenDota histogram field win into wins', () => {
    const snapshot = projectSnapshot(5, { opendota, steam: null, stratz: null });
    expect(snapshot.personaName).toBe('Anshef');
    expect(snapshot.rankTier).toBe(32);
    expect(snapshot.gpmHistogram).toEqual([{ x: 400, games: 2, wins: 1 }]);
    expect(snapshot.outcomes.deaths).toEqual([{ x: 2, games: 4, wins: 1 }]);
    expect(snapshot.outcomes.towerDamage).toEqual([{ x: 0, games: 5, wins: 1 }]);
    expect(snapshot.heroes).toEqual([{ heroId: 1, games: 2, wins: 1, lastPlayed: 10 }]);
    expect(snapshot.records[0]).toMatchObject({ source: 'opendota', wins: 1, losses: 1, available: true });
    expect(snapshot.records[1]?.available).toBe(false);
  });

  it('keeps a STRATZ short name when the hero id was not stored', () => {
    const rows = projectPerformances(5, {
      opendota: null,
      steam: null,
      stratz: {
        matches: [
          {
            id: 4,
            startDateTime: 50,
            durationSeconds: 1000,
            players: [
              {
                isVictory: true,
                kills: 1,
                deaths: 0,
                assists: 2,
                hero: { shortName: 'antimage' },
                item0Id: 1,
                neutral0Id: 0,
              },
            ],
          },
        ],
        match_details: [],
      },
    });
    expect(rows[0]).toMatchObject({
      source: 'stratz',
      heroId: null,
      heroShortName: 'antimage',
      items: [1, 0, 0, 0, 0, 0],
    });
  });

  it('does not turn a Steam history without winners into a 0-0 record', () => {
    const snapshot = projectSnapshot(5, {
      opendota: null,
      stratz: null,
      steam: {
        collected_at: '2026-09-26T00:00:00Z',
        matches: [
          {
            match_id: 1,
            start_time: 10,
            players: [{ account_id: 5, player_slot: 0, hero_id: 1 }],
          },
          {
            match_id: 2,
            start_time: 20,
            players: [{ account_id: 5, player_slot: 128, hero_id: 2 }],
          },
        ],
        match_details: [],
      },
    });
    expect(snapshot.records[1]).toMatchObject({ source: 'steam', wins: null, losses: null, games: 2, available: true });
  });
});

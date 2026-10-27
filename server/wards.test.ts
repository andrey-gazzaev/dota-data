import { describe, expect, it } from 'vitest';
import { listWardMatches, readMatchWards } from './wards';

const raw = {
  match_details: [
    {
      match_id: 9011504128,
      data: {
        start_time: 1_790_098_794,
        duration: 3398,
        players: [
          {
            account_id: 133439488,
            hero_id: 26,
            player_slot: 1,
            obs_log: [{ time: -38, x: 111.4, y: 163.4, ehandle: 6259662, player_slot: 1 }],
            obs_left_log: [{ time: 322, x: 111.4, y: 163.4, ehandle: 6259662, player_slot: 1 }],
            sen_log: [{ time: 16, x: 100, y: 100, ehandle: 11, player_slot: 1 }],
            sen_left_log: [{ time: 23, x: 100, y: 100, ehandle: 11, player_slot: 1 }],
          },
          {
            account_id: 9,
            hero_id: 1,
            player_slot: 128,
            obs_log: [{ time: 0, x: 80, y: 80, ehandle: 12, player_slot: 128 }],
            obs_left_log: [],
            sen_log: [],
            sen_left_log: [],
          },
        ],
      },
    },
    {
      match_id: 1,
      data: {
        start_time: 10,
        duration: 100,
        players: [{ account_id: 133439488, hero_id: 2, obs_log: [], sen_log: [] }],
      },
    },
    {
      match_id: 3,
      data: {
        start_time: 20,
        duration: 100,
        players: [{ account_id: 133439488, hero_id: 3, obs_log: [{ time: 10 }], sen_log: [] }],
      },
    },
  ],
};

describe('ward logs', () => {
  it('lists only matches that have ward coordinates, newest first', () => {
    expect(listWardMatches(raw, 133439488)).toEqual([
      { matchId: 9011504128, startTime: 1_790_098_794, duration: 3398, heroId: 26 },
    ]);
  });

  it('pairs a removal by ehandle and expires a ward that was never removed', () => {
    const match = readMatchWards(raw, 9011504128);
    expect(match?.marks).toEqual([
      { kind: 'observer', x: 111.4, y: 163.4, placedAt: -38, leftAt: 322, radiant: true, heroId: 26 },
      { kind: 'sentry', x: 100, y: 100, placedAt: 16, leftAt: 23, radiant: true, heroId: 26 },
      { kind: 'observer', x: 80, y: 80, placedAt: 0, leftAt: 360, radiant: false, heroId: 1 },
    ]);
    expect(readMatchWards(raw, 9011504128)?.parsed).toBe(true);
    expect(readMatchWards(raw, 1)).toMatchObject({ parsed: true, marks: [] });
    expect(readMatchWards(raw, 2)).toMatchObject({ parsed: false, marks: [] });
  });
});

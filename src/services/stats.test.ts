import { describe, expect, it } from 'vitest';
import type { HeroStat, MatchPerformance } from '@/models';
import {
  aggregateBuilds,
  aggregateCounters,
  aggregateSynergy,
  pickMatchups,
  dedupePerformances,
  gpmHistogram,
  heroStatsFromPerformances,
  mergeCloseBins,
  itemFrequency,
  dailyForm,
  matchExtremes,
  mergeHeroStats,
  winRate,
} from '@/services';

function row(patch: Partial<MatchPerformance> & Pick<MatchPerformance, 'matchId' | 'heroId'>): MatchPerformance {
  return {
    source: 'opendota',
    win: false,
    kills: 0,
    deaths: 0,
    assists: 0,
    goldPerMin: null,
    xpPerMin: null,
    towerDamage: null,
    heroDamage: null,
    lastHits: null,
    items: [],
    neutralItem: null,
    purchases: [],
    enemyHeroIds: [],
    allies: [],
    enemies: [],
    startTime: patch.matchId,
    duration: 1000,
    ...patch,
  };
}

describe('winRate', () => {
  it('returns null without games', () => {
    expect(winRate(1, 0)).toBeNull();
  });

  it('divides wins by games', () => {
    expect(winRate(1, 4)).toBe(0.25);
  });
});

describe('dedupePerformances', () => {
  it('keeps OpenDota over STRATZ and Steam for the same match', () => {
    const rows = dedupePerformances([
      row({ matchId: 1, heroId: 3, source: 'steam' }),
      row({ matchId: 1, heroId: 9, source: 'stratz' }),
      row({ matchId: 1, heroId: 1, source: 'opendota' }),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.heroId).toBe(1);
    expect(rows[0]?.source).toBe('opendota');
  });

  it('copies tower damage from STRATZ when OpenDota did not send it', () => {
    const rows = dedupePerformances([
      row({ matchId: 3, heroId: 1, source: 'stratz', towerDamage: 4000, heroDamage: 9000 }),
      row({ matchId: 3, heroId: 1, source: 'opendota' }),
    ]);
    expect(rows[0]).toMatchObject({ source: 'opendota', towerDamage: 4000, heroDamage: 9000 });
  });

  it('keeps the richer row when the source is the same', () => {
    const rows = dedupePerformances([
      row({ matchId: 2, heroId: 1, items: [1] }),
      row({ matchId: 2, heroId: 1, items: [1, 2], enemyHeroIds: [4] }),
    ]);
    expect(rows[0]?.items).toEqual([1, 2]);
    expect(rows[0]?.enemyHeroIds).toEqual([4]);
  });
});

describe('hero stats', () => {
  it('counts wins and keeps the latest match', () => {
    const stats = heroStatsFromPerformances([
      row({ matchId: 1, heroId: 5, win: true, startTime: 10 }),
      row({ matchId: 2, heroId: 5, win: false, startTime: 30 }),
      row({ matchId: 3, heroId: 8, win: true, startTime: 20 }),
    ]);
    expect(stats[0]).toMatchObject({ heroId: 5, games: 2, wins: 1, lastPlayed: 30 });
  });

  it('prefers the OpenDota hero block and fills heroes that exist only in matches', () => {
    const primary: HeroStat[] = [{ heroId: 5, games: 10, wins: 7, lastPlayed: 10 }];
    const fallback = heroStatsFromPerformances([
      row({ matchId: 1, heroId: 5, startTime: 40 }),
      row({ matchId: 2, heroId: 8, startTime: 15 }),
    ]);
    expect(mergeHeroStats(primary, fallback)).toEqual([
      { heroId: 5, games: 10, wins: 7, lastPlayed: 40 },
      { heroId: 8, games: 1, wins: 0, lastPlayed: 15 },
    ]);
  });
});

describe('builds and counters', () => {
  const matches = [
    row({ matchId: 1, heroId: 1, win: true, items: [2, 1, 0], neutralItem: 9, enemyHeroIds: [4, 5] }),
    row({ matchId: 2, heroId: 1, win: false, items: [1, 0, 2], neutralItem: 9, enemyHeroIds: [4] }),
    row({ matchId: 3, heroId: 1, win: true, items: [3], neutralItem: null, enemyHeroIds: [4] }),
    row({ matchId: 4, heroId: 1, win: false, items: [], enemyHeroIds: [8] }),
    row({ matchId: 5, heroId: 2, win: true, items: [1], enemyHeroIds: [4] }),
  ];

  it('collapses the same items regardless of slot order and keeps the neutral item', () => {
    const builds = aggregateBuilds(matches, 1);
    expect(builds[0]).toMatchObject({ items: [1, 2], neutralItem: 9, games: 2, wins: 1 });
    expect(builds[1]).toMatchObject({ items: [3], neutralItem: null, games: 1, wins: 1 });
  });

  it('counts how often an item appears', () => {
    expect(itemFrequency(matches, 1)[0]).toMatchObject({ itemId: 1, games: 2, wins: 1 });
  });

  it('drops enemy heroes below the sample threshold and sorts by the player win rate', () => {
    expect(aggregateCounters(matches, 1, 2)).toEqual([{ heroId: 4, games: 3, wins: 2 }]);
  });

  it('counts ally heroes and sorts the best win rate first', () => {
    const withAllies = [
      row({ matchId: 1, heroId: 1, win: true, allies: [{ heroId: 9, kills: 1, deaths: 0, assists: 1 }] }),
      row({ matchId: 2, heroId: 1, win: true, allies: [{ heroId: 9, kills: 2, deaths: 1, assists: 0 }] }),
      row({ matchId: 3, heroId: 1, win: false, allies: [{ heroId: 7, kills: 0, deaths: 1, assists: 2 }] }),
      row({ matchId: 4, heroId: 1, win: false, allies: [{ heroId: 7, kills: 0, deaths: 2, assists: 1 }] }),
    ];
    expect(aggregateSynergy(withAllies, 1, 2)).toEqual([
      { heroId: 9, games: 2, wins: 2 },
      { heroId: 7, games: 2, wins: 0 },
    ]);
  });

  it('drops short samples and orders the remaining pairs by win rate', () => {
    const rows = [
      { heroId: 1, games: 40, wins: 0 },
      { heroId: 2, games: 100, wins: 40 },
      { heroId: 3, games: 100, wins: 80 },
    ];
    expect(pickMatchups(rows, 'asc', 100, 15)).toEqual([
      { heroId: 2, games: 100, wins: 40 },
      { heroId: 3, games: 100, wins: 80 },
    ]);
    expect(pickMatchups(rows, 'desc', 100, 1)).toEqual([{ heroId: 3, games: 100, wins: 80 }]);
  });
});

describe('charts', () => {
  it('groups the newest matches into calendar days', () => {
    const morning = Date.UTC(2026, 8, 2, 12, 0, 0) / 1000;
    const evening = morning + 3 * 60 * 60;
    const nextDay = morning + 20 * 60 * 60;
    const older = morning - 3 * 24 * 60 * 60;
    const days = dailyForm(
      [
        row({ matchId: 1, heroId: 1, win: true, startTime: older }),
        row({ matchId: 2, heroId: 1, win: true, startTime: morning }),
        row({ matchId: 3, heroId: 1, win: false, startTime: evening }),
        row({ matchId: 4, heroId: 1, win: true, startTime: nextDay }),
      ],
      3,
    );
    expect(days).toHaveLength(2);
    expect(days[0]).toMatchObject({ wins: 1, losses: 0 });
    expect(days[1]).toMatchObject({ wins: 1, losses: 1 });
    expect(days[0]!.time).toBeGreaterThan(days[1]!.time);
  });

  it('picks extremes inside the newest window and keeps the result', () => {
    const extremes = matchExtremes(
      [
        row({ matchId: 1, heroId: 1, startTime: 1, deaths: 9, kills: 1, win: false, duration: 1000 }),
        row({
          matchId: 2,
          heroId: 4,
          startTime: 3,
          deaths: 0,
          kills: 12,
          win: true,
          duration: 1800,
          towerDamage: 500,
        }),
        row({
          matchId: 3,
          heroId: 4,
          startTime: 2,
          deaths: 0,
          kills: 4,
          win: false,
          duration: 900,
          towerDamage: 8000,
        }),
      ],
      2,
    );
    expect(extremes.find((item) => item.key === 'deaths')).toMatchObject({
      matchId: 2,
      value: 0,
      win: true,
      duration: 1800,
      window: 2,
    });
    expect(extremes.find((item) => item.key === 'towerDamage')).toMatchObject({ matchId: 3, value: 8000, win: false });
    expect(extremes.find((item) => item.key === 'heroDamage')).toBeUndefined();
  });

  it('merges neighboring bins while the win rate stays close', () => {
    expect(
      mergeCloseBins([
        { x: 0, games: 10, wins: 8 },
        { x: 1, games: 10, wins: 7 },
        { x: 2, games: 10, wins: 2 },
        { x: 3, games: 10, wins: 1 },
      ]),
    ).toEqual([
      { from: 0, to: 1, games: 20, wins: 15 },
      { from: 2, to: 3, games: 20, wins: 3 },
    ]);
  });

  it('bins GPM', () => {
    expect(
      gpmHistogram([
        row({ matchId: 1, heroId: 1, goldPerMin: 420, win: true }),
        row({ matchId: 2, heroId: 1, goldPerMin: 449, win: false }),
      ]),
    ).toEqual([{ x: 400, games: 2, wins: 1 }]);
  });
});

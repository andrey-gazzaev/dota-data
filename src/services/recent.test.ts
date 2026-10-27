import { describe, expect, it } from 'vitest';
import type { MatchPerformance } from '@/models';
import { hasMatchDetail, recentPerformances } from './recent';

function row(matchId: number, heroId: number, startTime: number, detailed = false): MatchPerformance {
  return {
    matchId,
    source: 'opendota',
    heroId,
    win: true,
    kills: 1,
    deaths: 0,
    assists: 2,
    goldPerMin: detailed ? 400 : null,
    xpPerMin: null,
    towerDamage: null,
    heroDamage: null,
    lastHits: null,
    items: detailed ? [1] : [],
    neutralItem: null,
    purchases: [],
    enemyHeroIds: [],
    allies: [],
    enemies: [],
    startTime,
    duration: 100,
  };
}

describe('recentPerformances', () => {
  it('keeps the 40 newest matches and can filter by hero', () => {
    const rows = Array.from({ length: 45 }, (_, index) => row(index + 1, index % 2 === 0 ? 7 : 8, index));
    expect(recentPerformances(rows, null).map((item) => item.matchId)[0]).toBe(45);
    expect(recentPerformances(rows, null)).toHaveLength(40);
    expect(recentPerformances(rows, 7).every((item) => item.heroId === 7)).toBe(true);
    expect(recentPerformances(rows, 7)).toHaveLength(23);
  });

  it('treats a summary with items as not parsed', () => {
    expect(hasMatchDetail(row(1, 1, 1, false))).toBe(false);
    expect(hasMatchDetail(row(1, 1, 1, true))).toBe(false);
    expect(hasMatchDetail({ ...row(1, 1, 1, true), enemyHeroIds: [4] })).toBe(true);
  });
});

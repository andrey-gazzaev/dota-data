import { describe, expect, it } from 'vitest';
import type { MatchPerformance } from '@/models';
import { metricBins } from './metric-bins';

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

describe('metric bins', () => {
  it('stacks wins and losses and joins bins with a close win rate', () => {
    expect(
      metricBins(
        [row({ matchId: 1, heroId: 1, deaths: 0, win: true }), row({ matchId: 2, heroId: 1, deaths: 1, win: true })],
        'deaths',
        'winRate',
        null,
      ),
    ).toEqual([{ label: '0–1', wins: 2, losses: 0, games: 2, value: null }]);
  });

  it('counts games in each step and skips a missing stat', () => {
    expect(
      metricBins(
        [
          row({ matchId: 1, heroId: 1, goldPerMin: 420, win: true }),
          row({ matchId: 2, heroId: 1, goldPerMin: 449, win: false }),
          row({ matchId: 3, heroId: 1, goldPerMin: null, win: true }),
        ],
        'goldPerMin',
        'games',
        null,
      ),
    ).toEqual([{ label: '400', wins: 1, losses: 1, games: 2, value: 2 }]);
  });

  it('averages the Y metric for one hero', () => {
    expect(
      metricBins(
        [
          row({ matchId: 1, heroId: 1, kills: 1, goldPerMin: 400 }),
          row({ matchId: 2, heroId: 1, kills: 1, goldPerMin: 500, win: true }),
          row({ matchId: 3, heroId: 2, kills: 1, goldPerMin: 900 }),
        ],
        'kills',
        'goldPerMin',
        1,
      ),
    ).toEqual([{ label: '1', wins: 1, losses: 1, games: 2, value: 450 }]);
  });
});

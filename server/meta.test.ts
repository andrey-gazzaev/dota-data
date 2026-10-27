import { describe, expect, it } from 'vitest';
import { mapHeroMetas } from './meta';

describe('mapHeroMetas', () => {
  it('reads every hero from a STRATZ matchup list', () => {
    expect(
      mapHeroMetas({
        data: {
          heroStats: {
            matchUp: [
              {
                heroId: 1,
                vs: [
                  { heroId2: 94, matchCount: 312, winCount: 204 },
                  { heroId2: 0, matchCount: 10, winCount: 1 },
                  { matchCount: 10, winCount: 1 },
                ],
                with: [{ heroId2: 50, matchCount: 646, winCount: 388 }],
              },
              { heroId: 2, vs: [{ heroId2: 1, matchCount: 80, winCount: 30 }], with: [] },
            ],
          },
        },
      }),
    ).toEqual([
      {
        heroId: 1,
        counters: [{ heroId: 94, games: 312, wins: 204 }],
        synergies: [{ heroId: 50, games: 646, wins: 388 }],
      },
      {
        heroId: 2,
        counters: [{ heroId: 1, games: 80, wins: 30 }],
        synergies: [],
      },
    ]);
  });

  it('drops heroes with no pairs and a missing id', () => {
    expect(
      mapHeroMetas({
        data: {
          heroStats: {
            matchUp: [
              { heroId: 0, vs: [{ heroId2: 1, matchCount: 10, winCount: 4 }], with: [] },
              { heroId: 127, vs: [], with: [] },
              { vs: [{ heroId2: 1, matchCount: 10, winCount: 4 }], with: [] },
            ],
          },
        },
      }),
    ).toEqual([]);
  });
});

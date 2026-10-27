import { describe, expect, it } from 'vitest';
import type { CounterStat } from '@/models';
import { DraftOdds } from './draft';

function table(counters: CounterStat[], synergies: CounterStat[] = []) {
  return { counters, synergies };
}

describe('DraftOdds', () => {
  it('turns an even matchup into an even chance', () => {
    const tables = new Map([[1, table([{ heroId: 2, games: 100, wins: 50 }])]]);
    expect(new DraftOdds(tables).chance([1], [2])?.chance).toBeCloseTo(0.5, 5);
  });

  it('keeps a one-sided counter near that win rate', () => {
    const tables = new Map([[1, table([{ heroId: 2, games: 200, wins: 140 }])]]);
    const chance = new DraftOdds(tables).chance([1], [2]);
    expect(chance?.chance).toBeCloseTo(0.7, 5);
    expect(chance?.counters).toEqual({ rate: 0.7, pairs: 1 });
    expect(chance?.worstCounter).toMatchObject({ leftId: 1, rightId: 2 });
  });

  it('adds our synergy and subtracts theirs', () => {
    const tables = new Map<number, { readonly counters: CounterStat[]; readonly synergies: CounterStat[] }>([
      [1, table([{ heroId: 2, games: 100, wins: 70 }], [{ heroId: 3, games: 100, wins: 50 }])],
      [2, table([], [{ heroId: 4, games: 100, wins: 40 }])],
      [3, table([])],
      [4, table([])],
    ]);
    const chance = new DraftOdds(tables).chance([1, 3], [2, 4]);
    expect(chance?.chance).toBeCloseTo(0.778, 2);
    expect(chance?.allySynergy).toEqual({ rate: 0.5, pairs: 1 });
    expect(chance?.enemySynergy).toEqual({ rate: 0.4, pairs: 1 });
    expect(chance?.bestSynergy).toMatchObject({ leftId: 1, rightId: 3 });
  });

  it('counts a synergy pair once and skips a short sample', () => {
    const tables = new Map<number, { readonly counters: CounterStat[]; readonly synergies: CounterStat[] }>([
      [1, table([], [{ heroId: 3, games: 200, wins: 80 }])],
      [3, table([{ heroId: 2, games: 40, wins: 40 }], [{ heroId: 1, games: 300, wins: 270 }])],
    ]);
    const chance = new DraftOdds(tables).chance([1, 3], [2]);
    expect(chance?.counters).toBeNull();
    expect(chance?.allySynergy).toEqual({ rate: 0.4, pairs: 1 });
  });

  it('returns nothing when every pair is too short', () => {
    const tables = new Map([[1, table([{ heroId: 2, games: 20, wins: 18 }])]]);
    expect(new DraftOdds(tables).chance([1], [2])).toBeNull();
  });

  it('recommends allies from the strongest chance down', () => {
    const tables = new Map<number, { readonly counters: CounterStat[]; readonly synergies: CounterStat[] }>([
      [1, table([{ heroId: 2, games: 100, wins: 40 }])],
      [3, table([{ heroId: 2, games: 100, wins: 80 }], [{ heroId: 1, games: 100, wins: 70 }])],
      [4, table([{ heroId: 2, games: 100, wins: 45 }])],
      [5, table([{ heroId: 2, games: 100, wins: 55 }])],
    ]);
    const odds = new DraftOdds(tables);
    const picks = odds.recommend([1], [2], [3, 4, 5], 5, 2);
    expect(picks.map((pick) => pick.heroId)).toEqual([3, 5]);
    expect(picks[0]?.chance).toBeGreaterThan(picks[1]?.chance ?? 1);
  });

  it('skips a full ally side and heroes already picked', () => {
    const tables = new Map([[3, table([{ heroId: 2, games: 100, wins: 80 }])]]);
    const odds = new DraftOdds(tables);
    expect(odds.recommend([1, 4, 5, 6, 7], [2], [3])).toEqual([]);
    expect(odds.recommend([], [2], [2, 3]).map((pick) => pick.heroId)).toEqual([3]);
  });
});

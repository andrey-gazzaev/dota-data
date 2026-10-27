import type { CounterStat } from '@/models';

const LOGIT_FLOOR = 0.01;

/** One hero pair and how often the left hero won it. */
export type DraftSample = {
  /** Hero whose win rate is counted. */
  readonly leftId: number;

  /** Hero on the other side of the pair. */
  readonly rightId: number;

  /** Matches in the pair. */
  readonly games: number;

  /** Wins for the left hero. */
  readonly wins: number;
};

/** Average win rate across the pairs that make up one part of a draft. */
export type DraftTerm = {
  /** Average win rate from 0 to 1. */
  readonly rate: number;

  /** Pairs included in the average. */
  readonly pairs: number;
};

/** Win chance for the allied side of a draft, with the pairs behind it. */
export type DraftChance = {
  /** Allied win chance from 0 to 1. */
  readonly chance: number;

  /** Counter pairs. Empty when none qualify. */
  readonly counters: DraftTerm | null;

  /** Allied synergy pairs. Empty when none qualify. */
  readonly allySynergy: DraftTerm | null;

  /** Enemy synergy pairs. Empty when none qualify. */
  readonly enemySynergy: DraftTerm | null;

  /** Worst counter pair. Empty when there is no scored pair. */
  readonly worstCounter: DraftSample | null;

  /** Best synergy pair. Empty when there is no scored pair. */
  readonly bestSynergy: DraftSample | null;
};

/** Matchup tables for one hero. */
type DraftTable = {
  /** Heroes that beat this hero. */
  readonly counters: readonly CounterStat[];

  /** Heroes that win with this hero. */
  readonly synergies: readonly CounterStat[];
};

/** Win chance for one side of a draft, from hero matchups. */
export class DraftOdds {
  /** Matchup tables used to score a draft. */
  public constructor(
    private readonly tables: ReadonlyMap<number, DraftTable>,
    private readonly minGames = 100,
  ) {}

  /** Win chance for these allies against these enemies. Empty when no pair has enough games. */
  public chance(allies: readonly number[], enemies: readonly number[]): DraftChance | null {
    const counters = this.matchups(allies, enemies, (left, right) =>
      this.pairRow(this.tables.get(left)?.counters, right),
    );
    const allySynergy = this.pairs(allies, (left, right) => this.directedPair(left, right));
    const enemySynergy = this.pairs(enemies, (left, right) => this.directedPair(left, right));
    if (counters.length === 0 && allySynergy.length === 0 && enemySynergy.length === 0) return null;

    let edge = 0;
    if (counters.length > 0) edge += this.meanLogit(counters);
    if (allySynergy.length > 0) edge += this.meanLogit(allySynergy);
    if (enemySynergy.length > 0) edge -= this.meanLogit(enemySynergy);

    return {
      chance: 1 / (1 + Math.exp(-edge)),
      counters: this.term(counters),
      allySynergy: this.term(allySynergy),
      enemySynergy: this.term(enemySynergy),
      worstCounter: this.extreme(counters, 'min'),
      bestSynergy: this.extreme(allySynergy, 'max'),
    };
  }

  /** Allies that most raise our win chance, best first. */
  public recommend(
    allies: readonly number[],
    enemies: readonly number[],
    candidates: readonly number[],
    slots = 5,
    limit = 5,
  ): { readonly heroId: number; readonly chance: number }[] {
    if (allies.length >= slots || limit <= 0) return [];

    const taken = new Set<number>([...allies, ...enemies]);
    const ranked: { readonly heroId: number; readonly chance: number }[] = [];
    for (const heroId of candidates) {
      if (taken.has(heroId)) continue;
      const next = this.chance([...allies, heroId], enemies);
      if (!next) continue;
      ranked.push({ heroId, chance: next.chance });
    }

    return ranked.sort((left, right) => right.chance - left.chance).slice(0, limit);
  }

  private matchups(
    leftIds: readonly number[],
    rightIds: readonly number[],
    read: (left: number, right: number) => CounterStat | null,
  ): DraftSample[] {
    const rows: DraftSample[] = [];
    for (const left of leftIds) {
      for (const right of rightIds) {
        const row = read(left, right);
        if (row) rows.push({ leftId: left, rightId: right, games: row.games, wins: row.wins });
      }
    }

    return rows;
  }

  private pairs(ids: readonly number[], read: (left: number, right: number) => CounterStat | null): DraftSample[] {
    const rows: DraftSample[] = [];
    for (let index = 0; index < ids.length; index += 1) {
      for (let next = index + 1; next < ids.length; next += 1) {
        const left = ids[index];
        const right = ids[next];
        if (left == null || right == null) continue;
        const row = read(left, right);
        if (row) rows.push({ leftId: left, rightId: right, games: row.games, wins: row.wins });
      }
    }

    return rows;
  }

  private directedPair(left: number, right: number): CounterStat | null {
    const [first, second] = left < right ? [left, right] : [right, left];
    return (
      this.pairRow(this.tables.get(first)?.synergies, second) ?? this.pairRow(this.tables.get(second)?.synergies, first)
    );
  }

  private pairRow(rows: readonly CounterStat[] | undefined, heroId: number): CounterStat | null {
    const row = rows?.find((item) => item.heroId === heroId);
    if (!row || row.games < this.minGames || row.wins < 0 || row.wins > row.games) return null;
    return row;
  }

  private term(rows: readonly DraftSample[]): DraftTerm | null {
    if (rows.length === 0) return null;
    return { rate: this.meanRate(rows), pairs: rows.length };
  }

  private extreme(rows: readonly DraftSample[], order: 'min' | 'max'): DraftSample | null {
    return rows.reduce<DraftSample | null>((best, row) => {
      if (!best) return row;
      const rate = row.wins / row.games;
      const bestRate = best.wins / best.games;
      if (order === 'min' ? rate < bestRate : rate > bestRate) return row;
      return best;
    }, null);
  }

  private meanRate(rows: readonly DraftSample[]): number {
    return rows.reduce((sum, row) => sum + row.wins / row.games, 0) / rows.length;
  }

  private meanLogit(rows: readonly DraftSample[]): number {
    return rows.reduce((sum, row) => sum + this.logit(row.wins / row.games), 0) / rows.length;
  }

  private logit(rate: number): number {
    const clamped = Math.min(1 - LOGIT_FLOOR, Math.max(LOGIT_FLOOR, rate));
    return Math.log(clamped / (1 - clamped));
  }
}

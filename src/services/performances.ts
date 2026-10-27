import type { DayForm, HistogramBin, HistogramSpan, MatchExtreme, MatchPerformance } from '@/models';

/** Win rate from 0 to 1. Empty when there are no games. */
export function winRate(wins: number, games: number): number | null {
  if (games <= 0) return null;
  return wins / games;
}

const SOURCE_PRIORITY = { opendota: 0, stratz: 1, steam: 2 } as const;

function richness(row: MatchPerformance): number {
  return row.enemyHeroIds.length + row.items.filter((item) => item > 0).length + (row.neutralItem ? 1 : 0);
}

function fillMissing(winner: MatchPerformance, other: MatchPerformance): MatchPerformance {
  return {
    ...winner,
    goldPerMin: winner.goldPerMin ?? other.goldPerMin,
    xpPerMin: winner.xpPerMin ?? other.xpPerMin,
    towerDamage: winner.towerDamage ?? other.towerDamage,
    heroDamage: winner.heroDamage ?? other.heroDamage,
    lastHits: winner.lastHits ?? other.lastHits,
    duration: winner.duration ?? other.duration,
  };
}

/** One row per match, keeping the richer source when the same match appears twice. */
export function dedupePerformances(rows: MatchPerformance[]): MatchPerformance[] {
  const best = new Map<number, MatchPerformance>();
  for (const row of rows) {
    const previous = best.get(row.matchId);
    if (!previous) {
      best.set(row.matchId, row);
      continue;
    }

    const previousRank = SOURCE_PRIORITY[previous.source];
    const nextRank = SOURCE_PRIORITY[row.source];
    const preferNext = nextRank < previousRank || (nextRank === previousRank && richness(row) > richness(previous));
    const winner = preferNext ? row : previous;
    const other = preferNext ? previous : row;
    best.set(row.matchId, fillMissing(winner, other));
  }

  return [...best.values()].sort((left, right) => right.startTime - left.startTime);
}

function calendarDay(unixSeconds: number): string {
  const date = new Date(unixSeconds * 1000);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Win-loss record for each day in the recent window. */
export function dailyForm(rows: readonly MatchPerformance[], window = 100): DayForm[] {
  const recent = [...rows].sort((left, right) => right.startTime - left.startTime).slice(0, window);
  const days = new Map<string, { readonly time: number; readonly wins: number; readonly losses: number }>();
  for (const row of recent) {
    const day = calendarDay(row.startTime);
    const current = days.get(day) ?? { time: row.startTime, wins: 0, losses: 0 };
    days.set(day, {
      time: Math.min(current.time, row.startTime),
      wins: current.wins + (row.win ? 1 : 0),
      losses: current.losses + (row.win ? 0 : 1),
    });
  }

  return [...days.entries()]
    .map(([day, value]) => ({ day, time: value.time, wins: value.wins, losses: value.losses }))
    .sort((left, right) => right.time - left.time);
}

/** Matches grouped into equal steps of one stat, with wins in each step. */
export function valueHistogram(
  rows: readonly MatchPerformance[],
  read: (row: MatchPerformance) => number | null,
  width: number,
): HistogramBin[] {
  const bins = new Map<number, { readonly games: number; readonly wins: number }>();
  if (width <= 0) return [];

  for (const row of rows) {
    const value = read(row);
    if (value == null) continue;
    const x = Math.floor(value / width) * width;
    const current = bins.get(x) ?? { games: 0, wins: 0 };
    bins.set(x, { games: current.games + 1, wins: current.wins + (row.win ? 1 : 0) });
  }

  return [...bins.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([x, bin]) => ({ x, games: bin.games, wins: bin.wins }));
}

/** Gold-per-minute counts across matches. */
export function gpmHistogram(rows: readonly MatchPerformance[], width = 50): HistogramBin[] {
  return valueHistogram(rows, (row) => row.goldPerMin, width);
}

/** Win-rate gap, as a fraction, inside which neighboring bins stay one span. */
const CLOSE_WIN_RATE = 0.12;

/** Neighboring bins joined while their win rates stay close. */
export function mergeCloseBins(bins: readonly HistogramBin[], rateGap = CLOSE_WIN_RATE): HistogramSpan[] {
  const sorted = bins.filter((bin) => bin.games > 0).sort((left, right) => left.x - right.x);
  const spans: HistogramSpan[] = [];
  for (const bin of sorted) {
    const last = spans.at(-1);
    const rate = bin.wins / bin.games;
    const groupRate = last && last.games > 0 ? last.wins / last.games : null;
    if (last && groupRate != null && Math.abs(rate - groupRate) <= rateGap) {
      spans[spans.length - 1] = {
        from: last.from,
        to: bin.x,
        games: last.games + bin.games,
        wins: last.wins + bin.wins,
      };
      continue;
    }
    spans.push({ from: bin.x, to: bin.x, games: bin.games, wins: bin.wins });
  }

  return spans;
}

const EXTREMES: {
  readonly key: MatchExtreme['key'];
  readonly pick: 'min' | 'max';
  readonly read: (row: MatchPerformance) => number | null;
}[] = [
  { key: 'deaths', pick: 'min', read: (row) => row.deaths },
  { key: 'kills', pick: 'max', read: (row) => row.kills },
  { key: 'assists', pick: 'max', read: (row) => row.assists },
  { key: 'towerDamage', pick: 'max', read: (row) => row.towerDamage },
  { key: 'heroDamage', pick: 'max', read: (row) => row.heroDamage },
  { key: 'goldPerMin', pick: 'max', read: (row) => row.goldPerMin },
  { key: 'lastHits', pick: 'max', read: (row) => row.lastHits },
];

function beats(
  pick: 'min' | 'max',
  read: (row: MatchPerformance) => number | null,
  candidate: MatchPerformance,
  current: MatchPerformance,
): boolean {
  const next = read(candidate);
  const previous = read(current);
  if (next == null || previous == null) return false;
  if (next !== previous) return pick === 'min' ? next < previous : next > previous;
  if (candidate.win !== current.win) return candidate.win;

  return candidate.startTime > current.startTime;
}

/** Extremes inside the newest matches. Stats missing on a row are skipped. */
export function matchExtremes(rows: readonly MatchPerformance[], window = 100): MatchExtreme[] {
  const recent = [...rows].sort((left, right) => right.startTime - left.startTime).slice(0, window);
  return EXTREMES.flatMap((spec) => {
    const known = recent.filter((row) => spec.read(row) != null);
    const best = known.reduce<MatchPerformance | null>((current, row) => {
      if (!current || beats(spec.pick, spec.read, row, current)) return row;
      return current;
    }, null);
    const value = best ? spec.read(best) : null;
    if (!best || value == null) return [];

    return [
      {
        key: spec.key,
        matchId: best.matchId,
        heroId: best.heroId,
        win: best.win,
        value,
        duration: best.duration,
        startTime: best.startTime,
        sample: known.length,
        window: recent.length,
      },
    ];
  });
}

import { asArray, asBoolean, asNumber, asRecord } from './json';
import { asDetailRows, detailFailed } from './merge';

const OBSERVER_LIFE = 360;
const SENTRY_LIFE = 240;

/** One ward event from a parsed match log. */
type LogEvent = {
  /** Seconds from the horn. Negative means before the horn. */
  readonly time: number;

  /** Horizontal game coordinate. */
  readonly x: number;

  /** Vertical game coordinate. */
  readonly y: number;

  /** Entity handle. Empty when the log did not send one. */
  readonly ehandle: number | null;

  /** True when the placing player was on Radiant. */
  readonly radiant: boolean;
};

/** One ward placement. */
export type WardMarkJson = {
  /** Observer or sentry. */
  readonly kind: 'observer' | 'sentry';

  /** Horizontal game coordinate from the ward log. */
  readonly x: number;

  /** Vertical game coordinate from the ward log. */
  readonly y: number;

  /** Seconds from the horn when the ward was placed. Negative means before the horn. */
  readonly placedAt: number;

  /** Seconds from the horn when the ward was destroyed or expired. */
  readonly leftAt: number;

  /** True when the placing player was on Radiant. */
  readonly radiant: boolean;

  /** Hero id of the player who placed the ward. 0 when the detail has no hero. */
  readonly heroId: number;
};

/** A match that can be shown on the ward map. */
export type WardMatchJson = {
  /** Dota match id. */
  readonly matchId: number;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. */
  readonly duration: number;

  /** Player's hero id. */
  readonly heroId: number;
};

/** Wards placed in one match. */
export type MatchWardsJson = {
  /** Dota match id. */
  readonly matchId: number;

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. */
  readonly duration: number;

  /** True when the match has a parsed ward log. */
  readonly parsed: boolean;

  /** Wards placed in this match. Empty when it is not parsed. */
  readonly marks: WardMarkJson[];
};

function events(player: Record<string, unknown>, key: string): LogEvent[] {
  return asArray(player[key]).flatMap((item) => {
    const row = asRecord(item);
    const time = asNumber(row?.time);
    const x = asNumber(row?.x);
    const y = asNumber(row?.y);
    if (!row || time == null || x == null || y == null) return [];
    const handle = asNumber(row.ehandle);
    const slot = asNumber(row.player_slot) ?? asNumber(player.player_slot) ?? 0;
    const radiantFlag = asBoolean(row.isRadiant);
    return [
      {
        time,
        x,
        y,
        ehandle: handle != null && handle !== 0 ? handle : null,
        radiant: radiantFlag ?? slot < 128,
      },
    ];
  });
}

function pair(
  placed: readonly LogEvent[],
  left: readonly LogEvent[],
  life: number,
  kind: WardMarkJson['kind'],
  heroId: number,
): WardMarkJson[] {
  const used = new Set<number>();
  return placed.map((place) => {
    const index =
      place.ehandle == null
        ? -1
        : left.findIndex((item, i) => !used.has(i) && item.ehandle === place.ehandle && item.time >= place.time);
    if (index >= 0) used.add(index);
    return {
      kind,
      x: place.x,
      y: place.y,
      placedAt: place.time,
      leftAt: index >= 0 ? left[index].time : place.time + life,
      radiant: place.radiant,
      heroId,
    };
  });
}

function playersOf(data: Record<string, unknown>): Record<string, unknown>[] {
  return asArray(data.players).flatMap((item) => {
    const row = asRecord(item);
    return row ? [row] : [];
  });
}

function marksOf(player: Record<string, unknown>): WardMarkJson[] {
  const heroId = asNumber(player.hero_id) ?? 0;
  return [
    ...pair(events(player, 'obs_log'), events(player, 'obs_left_log'), OBSERVER_LIFE, 'observer', heroId),
    ...pair(events(player, 'sen_log'), events(player, 'sen_left_log'), SENTRY_LIFE, 'sentry', heroId),
  ];
}

/** Parsed matches that include at least one ward, newest first. */
export function listWardMatches(raw: unknown, accountId: number): WardMatchJson[] {
  const root = asRecord(raw);
  if (!root) return [];
  const matches: WardMatchJson[] = [];
  for (const detail of asDetailRows(root.match_details)) {
    if (detailFailed(detail)) continue;
    const data = asRecord(detail.data);
    if (!data) continue;
    const players = playersOf(data);
    if (!players.some((player) => marksOf(player).length > 0)) continue;
    const self = players.find((player) => asNumber(player.account_id) === accountId);
    matches.push({
      matchId: detail.match_id,
      startTime: asNumber(data.start_time) ?? 0,
      duration: asNumber(data.duration) ?? 0,
      heroId: asNumber(self?.hero_id) ?? 0,
    });
  }
  matches.sort((left, right) => right.startTime - left.startTime || right.matchId - left.matchId);
  return matches;
}

/** Ward marks for one match. Unparsed until the match has a full detail. */
export function readMatchWards(raw: unknown, matchId: number): MatchWardsJson {
  const root = asRecord(raw);
  const summary = summaryClock(root, matchId);
  const empty: MatchWardsJson = { matchId, ...summary, parsed: false, marks: [] };
  if (!root) return empty;
  for (const detail of asDetailRows(root.match_details)) {
    if (detail.match_id !== matchId || detailFailed(detail)) continue;
    const data = asRecord(detail.data);
    if (!data) return empty;
    return {
      matchId,
      startTime: asNumber(data.start_time) ?? summary.startTime,
      duration: asNumber(data.duration) ?? summary.duration,
      parsed: true,
      marks: playersOf(data).flatMap(marksOf),
    };
  }
  return empty;
}

function summaryClock(
  root: Record<string, unknown> | null,
  matchId: number,
): { readonly startTime: number; readonly duration: number } {
  for (const item of asArray(root?.matches)) {
    const row = asRecord(item);
    if (asNumber(row?.match_id) !== matchId) continue;
    return { startTime: asNumber(row?.start_time) ?? 0, duration: asNumber(row?.duration) ?? 0 };
  }
  return { startTime: 0, duration: 0 };
}

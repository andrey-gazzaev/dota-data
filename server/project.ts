import { asArray, asBoolean, asNumber, asRecord, asString, unixSeconds } from './json';
import { asDetailRows, detailFailed } from './merge';

/** OpenDota, Steam, or STRATZ. */
export type SourceName = 'opendota' | 'steam' | 'stratz';

/** A teammate or opponent in one match. */
type LineupPlayer = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Kills. */
  readonly kills: number;

  /** Deaths. */
  readonly deaths: number;

  /** Assists. */
  readonly assists: number;
};

/** One player’s match taken from a source file. */
export type PerformanceRow = {
  /** Dota match id. */
  readonly matchId: number;

  /** Source this row was taken from. */
  readonly source: SourceName;

  /** Player's hero id. Empty when the source did not send it. */
  readonly heroId: number | null;

  /** Catalog key for the hero. Empty when the source did not send it. */
  readonly heroShortName: string | null;

  /** The player won this match. */
  readonly win: boolean;

  /** Player kills. */
  readonly kills: number;

  /** Player deaths. */
  readonly deaths: number;

  /** Player assists. */
  readonly assists: number;

  /** Gold per minute. Empty when the source did not send it. */
  readonly goldPerMin: number | null;

  /** Experience per minute. Empty when the source did not send it. */
  readonly xpPerMin: number | null;

  /** Damage dealt to buildings. Empty when the source did not send it. */
  readonly towerDamage: number | null;

  /** Damage dealt to heroes. Empty when the source did not send it. */
  readonly heroDamage: number | null;

  /** Creep last hits. Empty when the source did not send them. */
  readonly lastHits: number | null;

  /** Item ids in the six slots. Zero means an empty slot. */
  readonly items: number[];

  /** Neutral item id. Empty when there was no neutral slot. */
  readonly neutralItem: number | null;

  /** Item keys in the order they were bought. Empty when the source has no purchase log. */
  readonly purchases: string[];

  /** Enemy hero ids. */
  readonly enemyHeroIds: number[];

  /** Teammates, excluding this player. Empty when the match is not parsed. */
  readonly allies: LineupPlayer[];

  /** Opponents. Empty when the match is not parsed. */
  readonly enemies: LineupPlayer[];

  /** Match start, unix seconds. */
  readonly startTime: number;

  /** Match length in seconds. Empty when the source did not send it. */
  readonly duration: number | null;
};

/** Wins, losses, and why a source may be missing. */
export type SourceRecord = {
  /** Which source this row came from. */
  readonly source: SourceName;

  /** True when this source has a readable record. */
  readonly available: boolean;

  /** When the data was collected. Empty when the source was never collected. */
  readonly collectedAt: string | null;

  /** Wins. Empty when the source is unavailable. */
  readonly wins: number | null;

  /** Losses. Empty when the source is unavailable or results are unknown. */
  readonly losses: number | null;

  /** Matches counted when wins and losses are unknown. Empty when wins and losses are shown. */
  readonly games: number | null;

  /** Why the source was skipped. Empty when data is present. */
  readonly skipReason: string | null;
};

/** Games and wins for one hero stored on a snapshot. */
type SnapshotHero = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Matches played on this hero. */
  readonly games: number;

  /** Wins on this hero. */
  readonly wins: number;

  /** Start of the latest match, unix seconds. Empty when the time is unknown. */
  readonly lastPlayed: number | null;
};

/** One step of a histogram stored on a snapshot. */
type HistogramStep = {
  /** Start of the step. */
  readonly x: number;

  /** Matches in this step. */
  readonly games: number;

  /** Wins in this step. */
  readonly wins: number;
};

/** Win rate by kills, deaths, assists, and tower damage. */
type SnapshotOutcomes = {
  /** Wins by kill count. */
  readonly kills: HistogramStep[];

  /** Wins by death count. */
  readonly deaths: HistogramStep[];

  /** Wins by assist count. */
  readonly assists: HistogramStep[];

  /** Wins by tower damage. */
  readonly towerDamage: HistogramStep[];
};

/** Profile, records, and hero totals for one account. */
export type Snapshot = {
  /** Steam account id, not SteamID64. */
  readonly accountId: number;

  /** Name shown in the header. */
  readonly personaName: string;

  /** Avatar URL. Empty when the profile did not send one. */
  readonly avatarUrl: string | null;

  /** Profile URL. Empty when none is available. */
  readonly profileUrl: string | null;

  /** OpenDota medal. Empty when rank was not recorded. */
  readonly rankTier: number | null;

  /** Leaderboard place. Empty outside the top list. */
  readonly leaderboardRank: number | null;

  /** OpenDota MMR estimate. Empty when it was not sent. */
  readonly computedMmr: number | null;

  /** STRATZ medal. Empty when STRATZ did not send a rank. */
  readonly seasonRank: number | null;

  /** Win/loss record for each source. */
  readonly records: SourceRecord[];

  /** Heroes this player has played. */
  readonly heroes: SnapshotHero[];

  /** Gold-per-minute counts. */
  readonly gpmHistogram: HistogramStep[];

  /** Win rate by kills, deaths, assists, and tower damage. */
  readonly outcomes: SnapshotOutcomes;

  /** True when a saved snapshot exists for this player. */
  readonly hasLocalData: boolean;
};

/** Raw source files for one account. */
type Bundle = {
  /** OpenDota file. Empty when it was not saved. */
  readonly opendota: unknown | null;

  /** Steam file. Empty when it was not saved. */
  readonly steam: unknown | null;

  /** STRATZ file. Empty when it was not saved. */
  readonly stratz: unknown | null;
};

function itemsFrom(row: Record<string, unknown>, keys: string[]): number[] {
  return keys.map((key) => asNumber(row[key]) ?? 0);
}

function purchaseKeys(row: Record<string, unknown>): string[] {
  return asArray(row.purchase_log)
    .flatMap((entry) => {
      const purchase = asRecord(entry);
      const key = asString(purchase?.key);
      if (!purchase || !key) return [];
      return [{ key, time: asNumber(purchase.time) ?? 0 }];
    })
    .sort((left, right) => left.time - right.time)
    .map((entry) => entry.key);
}

function firstNumber(row: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = asNumber(row[key]);
    if (value != null) return value;
  }
  return null;
}

function combatOf(
  row: Record<string, unknown>,
): Pick<PerformanceRow, 'goldPerMin' | 'xpPerMin' | 'towerDamage' | 'heroDamage' | 'lastHits'> {
  return {
    goldPerMin: firstNumber(row, ['gold_per_min', 'goldPerMinute', 'goldPerMin']),
    xpPerMin: firstNumber(row, ['xp_per_min', 'experiencePerMinute', 'xpPerMin']),
    towerDamage: firstNumber(row, ['tower_damage', 'towerDamage']),
    heroDamage: firstNumber(row, ['hero_damage', 'heroDamage']),
    lastHits: firstNumber(row, ['last_hits', 'lastHits', 'numLastHits']),
  };
}

function withCombat(row: PerformanceRow, source: Record<string, unknown>): PerformanceRow {
  const combat = combatOf(source);
  return {
    ...row,
    goldPerMin: row.goldPerMin ?? combat.goldPerMin,
    xpPerMin: row.xpPerMin ?? combat.xpPerMin,
    towerDamage: row.towerDamage ?? combat.towerDamage,
    heroDamage: row.heroDamage ?? combat.heroDamage,
    lastHits: row.lastHits ?? combat.lastHits,
  };
}

function positiveOrNull(value: number | null): number | null {
  return value != null && value > 0 ? value : null;
}

function performance(
  patch: Partial<PerformanceRow> & Pick<PerformanceRow, 'matchId' | 'source' | 'win' | 'startTime'>,
): PerformanceRow {
  return {
    heroId: null,
    heroShortName: null,
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
    duration: null,
    ...patch,
  };
}

function isRadiant(row: Record<string, unknown>): boolean | null {
  const flag = asBoolean(row.isRadiant);
  if (flag != null) return flag;
  const slot = asNumber(row.player_slot);
  if (slot == null) return null;
  return slot < 128;
}

function openDotaPlayer(players: unknown[], accountId: number): Record<string, unknown> | null {
  for (const player of players) {
    const row = asRecord(player);
    if (row && asNumber(row.account_id) === accountId) return row;
  }
  return null;
}

function scoreOf(row: Record<string, unknown>, heroId: number): LineupPlayer {
  return {
    heroId,
    kills: asNumber(row.kills) ?? 0,
    deaths: asNumber(row.deaths) ?? 0,
    assists: asNumber(row.assists) ?? 0,
  };
}

function sidesOf(
  players: unknown[],
  self: Record<string, unknown>,
  heroIdOf: (row: Record<string, unknown>) => number | null,
  slotOf: (row: Record<string, unknown>) => number,
): { readonly allies: LineupPlayer[]; readonly enemies: LineupPlayer[]; readonly enemyHeroIds: number[] } {
  const radiant = isRadiant(self);
  const allies: { readonly player: LineupPlayer; readonly slot: number; readonly index: number }[] = [];
  const enemies: { readonly player: LineupPlayer; readonly slot: number; readonly index: number }[] = [];
  players.forEach((entry, index) => {
    const row = asRecord(entry);
    if (!row || row === self || radiant == null) return;
    const side = isRadiant(row);
    const heroId = heroIdOf(row);
    if (side == null || heroId == null || heroId <= 0) return;
    const bucket = side === radiant ? allies : enemies;
    bucket.push({ player: scoreOf(row, heroId), slot: slotOf(row), index });
  });
  const ordered = (bucket: { readonly player: LineupPlayer; readonly slot: number; readonly index: number }[]) =>
    bucket.sort((left, right) => left.slot - right.slot || left.index - right.index).map((item) => item.player);
  const enemyPlayers = ordered(enemies);
  return {
    allies: ordered(allies),
    enemies: enemyPlayers,
    enemyHeroIds: enemyPlayers.map((player) => player.heroId),
  };
}

function openDotaHeroId(row: Record<string, unknown>): number | null {
  return asNumber(row.hero_id);
}

function openDotaSlot(row: Record<string, unknown>): number {
  return asNumber(row.player_slot) ?? 0;
}

function fromOpenDotaDetail(accountId: number, matchId: number, data: Record<string, unknown>): PerformanceRow | null {
  const players = asArray(data.players);
  const player = openDotaPlayer(players, accountId);
  if (!player) return null;
  const sides = sidesOf(players, player, openDotaHeroId, openDotaSlot);
  const win = asBoolean(player.win);
  return performance({
    matchId,
    source: 'opendota',
    heroId: positiveOrNull(asNumber(player.hero_id)),
    win: win ?? false,
    kills: asNumber(player.kills) ?? 0,
    deaths: asNumber(player.deaths) ?? 0,
    assists: asNumber(player.assists) ?? 0,
    ...combatOf(player),
    items: itemsFrom(player, ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5']),
    neutralItem: positiveOrNull(asNumber(player.item_neutral)),
    purchases: purchaseKeys(player),
    ...sides,
    startTime: asNumber(data.start_time) ?? 0,
    duration: asNumber(data.duration),
  });
}

function fromOpenDotaSummary(row: Record<string, unknown>): PerformanceRow | null {
  const matchId = asNumber(row.match_id);
  const heroId = asNumber(row.hero_id);
  if (matchId == null || heroId == null) return null;
  const slot = asNumber(row.player_slot) ?? 0;
  const radiantWin = asBoolean(row.radiant_win) ?? false;
  return performance({
    matchId,
    source: 'opendota',
    heroId,
    win: slot < 128 === radiantWin,
    kills: asNumber(row.kills) ?? 0,
    deaths: asNumber(row.deaths) ?? 0,
    assists: asNumber(row.assists) ?? 0,
    ...combatOf(row),
    startTime: asNumber(row.start_time) ?? 0,
    duration: asNumber(row.duration),
  });
}

/** Matches taken from an OpenDota file. */
export function projectOpenDotaPerformances(raw: unknown, accountId: number): PerformanceRow[] {
  const root = asRecord(raw);
  if (!root) return [];
  const detailed = new Map<number, PerformanceRow>();
  for (const detail of asDetailRows(root.match_details)) {
    if (detailFailed(detail)) continue;
    const data = asRecord(detail.data);
    if (!data) continue;
    const row = fromOpenDotaDetail(accountId, detail.match_id, data);
    if (row) detailed.set(row.matchId, row);
  }
  const rows = [...detailed.values()];
  for (const match of asArray(root.matches)) {
    const summary = asRecord(match);
    const matchId = asNumber(summary?.match_id);
    if (!summary || matchId == null || detailed.has(matchId)) continue;
    const row = fromOpenDotaSummary(summary);
    if (row) rows.push(row);
  }
  const recent = new Map<number, Record<string, unknown>>();
  for (const item of asArray(root.recent_matches)) {
    const row = asRecord(item);
    const matchId = asNumber(row?.match_id);
    if (row && matchId != null) recent.set(matchId, row);
  }
  return rows.map((row) => {
    const extra = recent.get(row.matchId);
    return extra ? withCombat(row, extra) : row;
  });
}

function steamWin(player: Record<string, unknown>, data: Record<string, unknown>): boolean {
  const radiant = isRadiant(player);
  const radiantWin = asBoolean(data.radiant_win);
  if (radiant == null || radiantWin == null) return false;
  return radiant === radiantWin;
}

function fromSteamDetail(accountId: number, matchId: number, data: Record<string, unknown>): PerformanceRow | null {
  const players = asArray(data.players);
  const player = openDotaPlayer(players, accountId);
  if (!player) return null;
  const sides = sidesOf(players, player, openDotaHeroId, openDotaSlot);
  return performance({
    matchId,
    source: 'steam',
    heroId: positiveOrNull(asNumber(player.hero_id)),
    win: steamWin(player, data),
    kills: asNumber(player.kills) ?? 0,
    deaths: asNumber(player.deaths) ?? 0,
    assists: asNumber(player.assists) ?? 0,
    ...combatOf(player),
    items: itemsFrom(player, ['item_0', 'item_1', 'item_2', 'item_3', 'item_4', 'item_5']),
    startTime: asNumber(data.start_time) ?? 0,
    duration: asNumber(data.duration),
    ...sides,
  });
}

/** Matches taken from a Steam file. */
export function projectSteamPerformances(raw: unknown, accountId: number): PerformanceRow[] {
  const root = asRecord(raw);
  if (!root) return [];
  const detailed = new Map<number, PerformanceRow>();
  for (const detail of asDetailRows(root.match_details)) {
    if (detailFailed(detail)) continue;
    const data = asRecord(detail.data);
    if (!data) continue;
    const row = fromSteamDetail(accountId, detail.match_id, data);
    if (row) detailed.set(row.matchId, row);
  }
  const rows = [...detailed.values()];
  for (const match of asArray(root.matches)) {
    const summary = asRecord(match);
    const matchId = asNumber(summary?.match_id);
    if (!summary || matchId == null || detailed.has(matchId)) continue;
    const player = openDotaPlayer(asArray(summary.players), accountId);
    const heroId = asNumber(player?.hero_id);
    const radiantWin = asBoolean(summary.radiant_win);
    if (!player || heroId == null || radiantWin == null) continue;
    const slot = asNumber(player.player_slot) ?? 0;
    rows.push(
      performance({
        matchId,
        source: 'steam',
        heroId,
        win: slot < 128 === radiantWin,
        startTime: asNumber(summary.start_time) ?? 0,
      }),
    );
  }
  return rows;
}

function stratzPlayer(players: unknown[], accountId: number): Record<string, unknown> | null {
  const rows = players.flatMap((entry) => {
    const row = asRecord(entry);
    return row ? [row] : [];
  });
  const mine = rows.find((row) => asNumber(asRecord(row.steamAccount)?.id) === accountId);
  if (mine) return mine;
  return rows.length === 1 ? (rows[0] ?? null) : null;
}

function fromStratzPlayer(
  matchId: number,
  startTime: number,
  duration: number | null,
  player: Record<string, unknown>,
  players: unknown[],
): PerformanceRow | null {
  const hero = asRecord(player.hero);
  const heroId = positiveOrNull(asNumber(hero?.id));
  const sides = sidesOf(
    players,
    player,
    (row) => asNumber(asRecord(row.hero)?.id),
    (row) => asNumber(row.playerSlot) ?? 0,
  );
  return performance({
    matchId,
    source: 'stratz',
    heroId,
    heroShortName: asString(hero?.shortName),
    win: asBoolean(player.isVictory) ?? false,
    kills: asNumber(player.kills) ?? 0,
    deaths: asNumber(player.deaths) ?? 0,
    assists: asNumber(player.assists) ?? 0,
    ...combatOf(player),
    items: itemsFrom(player, ['item0Id', 'item1Id', 'item2Id', 'item3Id', 'item4Id', 'item5Id']),
    neutralItem: positiveOrNull(asNumber(player.neutral0Id)),
    ...sides,
    startTime,
    duration,
  });
}

function fromStratzMatch(row: Record<string, unknown>, accountId: number): PerformanceRow | null {
  const matchId = asNumber(row.id);
  if (matchId == null) return null;
  const players = asArray(row.players);
  const player = stratzPlayer(players, accountId);
  if (!player) return null;
  const start = asNumber(row.startDateTime);
  return fromStratzPlayer(
    matchId,
    start == null ? 0 : unixSeconds(start),
    asNumber(row.durationSeconds),
    player,
    players,
  );
}

/** Matches taken from a STRATZ file. */
export function projectStratzPerformances(raw: unknown, accountId: number): PerformanceRow[] {
  const root = asRecord(raw);
  if (!root) return [];
  const detailed = new Map<number, PerformanceRow>();
  for (const detail of asDetailRows(root.match_details)) {
    if (detailFailed(detail)) continue;
    const data = asRecord(detail.data);
    if (!data) continue;
    const row = fromStratzMatch(data, accountId);
    if (row) detailed.set(detail.match_id, { ...row, matchId: detail.match_id });
  }
  const rows = [...detailed.values()];
  const seen = new Set(detailed.keys());
  for (const match of asArray(root.matches)) {
    const summary = asRecord(match);
    const matchId = asNumber(summary?.id);
    if (!summary || matchId == null || seen.has(matchId)) continue;
    const row = fromStratzMatch(summary, accountId);
    if (row) rows.push(row);
  }
  return rows;
}

/** Matches from all three sources. */
export function projectPerformances(accountId: number, bundle: Bundle): PerformanceRow[] {
  return [
    ...projectOpenDotaPerformances(bundle.opendota, accountId),
    ...projectStratzPerformances(bundle.stratz, accountId),
    ...projectSteamPerformances(bundle.steam, accountId),
  ];
}

function countRecord(rows: PerformanceRow[]): { readonly wins: number; readonly losses: number } {
  let wins = 0;
  let losses = 0;
  for (const row of rows) {
    if (row.win) wins += 1;
    else losses += 1;
  }
  return { wins, losses };
}

function histogram(value: unknown): Snapshot['gpmHistogram'] {
  return asArray(value).flatMap((item) => {
    const row = asRecord(item);
    const x = asNumber(row?.x);
    const games = asNumber(row?.games);
    const wins = asNumber(row?.win);
    if (!row || x == null || games == null || wins == null) return [];
    return [{ x, games, wins }];
  });
}

function openDotaHeroes(raw: unknown): Snapshot['heroes'] {
  return asArray(asRecord(raw)?.heroes).flatMap((item) => {
    const row = asRecord(item);
    const heroId = asNumber(row?.hero_id);
    const games = asNumber(row?.games);
    const wins = asNumber(row?.win);
    if (!row || heroId == null || games == null || wins == null) return [];
    return [{ heroId, games, wins, lastPlayed: asNumber(row.last_played) }];
  });
}

function record(
  source: SourceName,
  raw: unknown | null,
  wins: number | null,
  losses: number | null,
  games: number | null,
): SourceRecord {
  return {
    source,
    available: raw != null,
    collectedAt: asString(asRecord(raw)?.collected_at),
    wins: raw == null ? null : wins,
    losses: raw == null ? null : losses,
    games: raw == null ? null : games,
    skipReason: null,
  };
}

/** Profile and records for one account. */
export function projectSnapshot(accountId: number, bundle: Bundle): Snapshot {
  const openRoot = asRecord(bundle.opendota);
  const openProfile = asRecord(openRoot?.profile);
  const openInner = asRecord(openProfile?.profile);
  const steamProfile = asRecord(asRecord(bundle.steam)?.profile);
  const stratzProfile = asRecord(asRecord(bundle.stratz)?.profile);
  const stratzAccount = asRecord(stratzProfile?.steamAccount);
  const openRows = projectOpenDotaPerformances(bundle.opendota, accountId);
  const steamRows = projectSteamPerformances(bundle.steam, accountId);
  const stratzRows = projectStratzPerformances(bundle.stratz, accountId);
  const openCounts = countRecord(openRows);
  const steamCounts = countRecord(steamRows);
  const steamHistory = asArray(asRecord(bundle.steam)?.matches).length;
  const steamGames = bundle.steam && steamRows.length === 0 && steamHistory > 0 ? steamHistory : null;
  const stratzCounts = countRecord(stratzRows);
  const winLoss = asRecord(openRoot?.win_loss);
  const openWins = asNumber(winLoss?.win) ?? (bundle.opendota ? openCounts.wins : null);
  const openLosses = asNumber(winLoss?.lose) ?? (bundle.opendota ? openCounts.losses : null);
  const stratzWins = asNumber(stratzProfile?.winCount);
  const stratzMatches = asNumber(stratzProfile?.matchCount);
  const histograms = asRecord(openRoot?.histograms);
  return {
    accountId,
    personaName:
      asString(openInner?.personaname) ??
      asString(steamProfile?.personaname) ??
      asString(stratzAccount?.name) ??
      `Игрок ${accountId}`,
    avatarUrl: asString(openInner?.avatarfull) ?? asString(steamProfile?.avatarfull) ?? asString(stratzAccount?.avatar),
    profileUrl:
      asString(openInner?.profileurl) ?? asString(steamProfile?.profileurl) ?? asString(stratzAccount?.profileUri),
    rankTier: asNumber(openProfile?.rank_tier),
    leaderboardRank: asNumber(openProfile?.leaderboard_rank) ?? asNumber(stratzAccount?.seasonLeaderboardRank),
    computedMmr: asNumber(openProfile?.computed_mmr),
    seasonRank: asNumber(stratzAccount?.seasonRank),
    records: [
      record('opendota', bundle.opendota, openWins, openLosses, null),
      record(
        'steam',
        bundle.steam,
        bundle.steam && steamGames == null ? steamCounts.wins : null,
        bundle.steam && steamGames == null ? steamCounts.losses : null,
        steamGames,
      ),
      record(
        'stratz',
        bundle.stratz,
        stratzWins ?? (bundle.stratz ? stratzCounts.wins : null),
        stratzMatches != null && stratzWins != null
          ? Math.max(0, stratzMatches - stratzWins)
          : bundle.stratz
            ? stratzCounts.losses
            : null,
        null,
      ),
    ],
    heroes: openDotaHeroes(bundle.opendota),
    gpmHistogram: histogram(histograms?.gpm),
    outcomes: {
      kills: histogram(histograms?.kills),
      deaths: histogram(histograms?.deaths),
      assists: histogram(histograms?.assists),
      towerDamage: histogram(histograms?.tower_damage),
    },
    hasLocalData: bundle.opendota != null || bundle.steam != null || bundle.stratz != null,
  };
}

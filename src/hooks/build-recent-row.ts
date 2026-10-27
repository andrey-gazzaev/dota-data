import type { ItemInfo, MatchPerformance } from '@/models';
import { formatDate, formatLength, formatWinRate, hasMatchDetail, type DraftOdds } from '@/services';
import type { LineupChipVm, MatchChipVm, RecentMatchRowVm } from '@/view-models';

function chip(
  map: Map<number, { readonly localizedName: string; readonly image: string }>,
  id: number,
  empty: string,
): MatchChipVm {
  const info = map.get(id);
  return { id, name: info?.localizedName ?? `${empty} ${id}`, image: info?.image ?? '' };
}

function itemChip(map: Map<number, ItemInfo>, id: number): MatchChipVm {
  return chip(map, id, 'Предмет');
}

function sides(row: MatchPerformance): { readonly allies: number[]; readonly enemies: number[] } | null {
  const enemies = row.enemies.map((player) => player.heroId).filter((id) => id > 0);
  const enemyIds = enemies.length > 0 ? enemies : row.enemyHeroIds.filter((id) => id > 0);
  const allies = [row.heroId, ...row.allies.map((player) => player.heroId)].filter((id) => id > 0);
  if (allies.length === 0 || enemyIds.length === 0) return null;

  return { allies, enemies: enemyIds };
}

function draftOf(
  row: MatchPerformance,
  pending: boolean,
  odds: DraftOdds,
): Pick<RecentMatchRowVm, 'draftLabel' | 'draftTone'> {
  const lineup = sides(row);
  if (!lineup) return { draftLabel: '—', draftTone: 'muted' };
  if (pending) return { draftLabel: '…', draftTone: 'muted' };

  const chance = odds.chance(lineup.allies, lineup.enemies);
  if (!chance) return { draftLabel: '—', draftTone: 'muted' };

  return { draftLabel: formatWinRate(chance.chance), draftTone: chance.chance >= 0.5 ? 'win' : 'loss' };
}

function lineupChip(
  map: Map<number, { readonly localizedName: string; readonly image: string }>,
  player: { readonly heroId: number; readonly kills: number; readonly deaths: number; readonly assists: number },
): LineupChipVm {
  return { ...chip(map, player.heroId, 'Герой'), score: `${player.kills}/${player.deaths}/${player.assists}` };
}

/** One recent match ready to show, including its draft chance. */
export function buildRecentRow(
  row: MatchPerformance,
  heroes: Map<number, { readonly localizedName: string; readonly image: string }>,
  items: Map<number, ItemInfo>,
  pending: boolean,
  odds: DraftOdds,
): RecentMatchRowVm {
  return {
    matchId: row.matchId,
    date: formatDate(row.startTime),
    hero: heroes.get(row.heroId)?.localizedName ?? `Герой ${row.heroId}`,
    heroImage: heroes.get(row.heroId)?.image ?? '',
    score: `${row.kills}/${row.deaths}/${row.assists}`,
    win: row.win,
    result: row.win ? 'Победа' : 'Поражение',
    length: formatLength(row.duration),
    parsed: hasMatchDetail(row),
    goldPerMin: row.goldPerMin,
    xpPerMin: row.xpPerMin,
    items: row.items.filter((id) => id > 0).map((id) => itemChip(items, id)),
    neutral: row.neutralItem != null && row.neutralItem > 0 ? itemChip(items, row.neutralItem) : null,
    purchases: row.purchases.filter((id) => id > 0).map((id) => itemChip(items, id)),
    allies: row.allies.map((player) => lineupChip(heroes, player)),
    enemies: row.enemies.map((player) => lineupChip(heroes, player)),
    ...draftOf(row, pending, odds),
  };
}

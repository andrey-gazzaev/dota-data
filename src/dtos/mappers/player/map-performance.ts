import type { GameCatalog, HeroInfo, MatchPerformance } from '@/models';
import { normalizeHeroKey } from '@/models';
import type { PerformanceDto } from '../../schemas/player/performance.schema';

function heroIndexes(catalog: GameCatalog): {
  readonly byId: Map<number, HeroInfo>;
  readonly byShort: Map<string, HeroInfo>;
} {
  const byId = new Map<number, HeroInfo>();
  const byShort = new Map<string, HeroInfo>();
  for (const hero of catalog.heroes) {
    byId.set(hero.id, hero);
    byShort.set(normalizeHeroKey(hero.shortName), hero);
  }

  return { byId, byShort };
}

function itemIdsByKey(catalog: GameCatalog): Map<string, number> {
  const ids = new Map<string, number>();
  for (const item of catalog.items) {
    ids.set(item.name, item.id);
    const short = item.name.replace(/^item_/, '');
    if (!ids.has(short)) ids.set(short, item.id);
  }
  return ids;
}

function purchaseIds(keys: readonly string[], itemsByKey: Map<string, number>): number[] {
  return keys.flatMap((key) => {
    const id = itemsByKey.get(key) ?? itemsByKey.get(`item_${key}`);
    return id != null && id > 0 ? [id] : [];
  });
}

/** One match row. Empty when the hero cannot be named. */
export function mapPerformance(
  dto: PerformanceDto,
  byShort: Map<string, HeroInfo>,
  itemsByKey: Map<string, number> = new Map(),
): MatchPerformance | null {
  let heroId = dto.heroId;
  if ((heroId == null || heroId <= 0) && dto.heroShortName) {
    heroId = byShort.get(normalizeHeroKey(dto.heroShortName))?.id ?? null;
  }
  if (heroId == null || heroId <= 0) return null;

  const neutral = dto.neutralItem != null && dto.neutralItem > 0 ? dto.neutralItem : null;

  return {
    matchId: dto.matchId,
    source: dto.source,
    heroId,
    win: dto.win,
    kills: dto.kills,
    deaths: dto.deaths,
    assists: dto.assists,
    goldPerMin: dto.goldPerMin,
    xpPerMin: dto.xpPerMin,
    towerDamage: dto.towerDamage,
    heroDamage: dto.heroDamage,
    lastHits: dto.lastHits,
    items: dto.items.slice(0, 6),
    neutralItem: neutral,
    purchases: purchaseIds(dto.purchases, itemsByKey),
    enemyHeroIds: dto.enemyHeroIds.filter((id) => id > 0),
    allies: dto.allies.filter((player) => player.heroId > 0),
    enemies: dto.enemies.filter((player) => player.heroId > 0),
    startTime: dto.startTime,
    duration: dto.duration,
  };
}

/** Match rows for these games. */
export function mapPerformances(rows: PerformanceDto[], catalog: GameCatalog): MatchPerformance[] {
  const { byShort } = heroIndexes(catalog);
  const itemsByKey = itemIdsByKey(catalog);
  return rows.flatMap((row) => {
    const mapped = mapPerformance(row, byShort, itemsByKey);
    return mapped ? [mapped] : [];
  });
}

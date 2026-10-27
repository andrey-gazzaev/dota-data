import path from 'node:path';
import { cacheDir, dataDir, ensureDir, readJson, writeJson } from './files';
import { fetchJson, RateLimiter } from './http';
import { asArray, asNumber, asRecord, asString } from './json';

const HEROES = 'https://api.opendota.com/api/constants/heroes';
const ITEMS = 'https://api.opendota.com/api/constants/items';
const WEEK = 7 * 24 * 60 * 60 * 1000;

/** A hero from the constants catalog. */
type CatalogHero = {
  /** Hero id in Dota. */
  readonly id: number;

  /** OpenDota display name, usually English. */
  readonly localizedName: string;

  /** Catalog key for the portrait. */
  readonly shortName: string;

  /** Primary attribute. `all` means a universal hero. */
  readonly attribute: HeroAttribute;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;
};

/** An item from the constants catalog. */
type CatalogItem = {
  /** Item id in Dota. */
  readonly id: number;

  /** Catalog key, usually starting with `item_`. */
  readonly name: string;

  /** Display name. */
  readonly localizedName: string;

  /** Image URL. Empty when the catalog has no image. */
  readonly image: string;
};

/** Heroes and items. */
export type Catalog = {
  /** Heroes that can be named. */
  readonly heroes: CatalogHero[];

  /** Items that can be named. */
  readonly items: CatalogItem[];
};

type HeroAttribute = 'str' | 'agi' | 'int' | 'all';

function heroAttribute(value: unknown): HeroAttribute | null {
  return value === 'str' || value === 'agi' || value === 'int' || value === 'all' ? value : null;
}

function imageUrl(value: unknown): string {
  const img = asString(value);
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `https://cdn.cloudflare.steamstatic.com${img.startsWith('/') ? '' : '/'}${img}`;
}

/** Heroes and items from the constant files. */
export function mapConstants(heroesRaw: unknown, itemsRaw: unknown): Catalog {
  const heroes = Object.values(asRecord(heroesRaw) ?? {}).flatMap((entry) => {
    const row = asRecord(entry);
    const id = asNumber(row?.id);
    const name = asString(row?.name);
    const localized = asString(row?.localized_name);
    const attribute = heroAttribute(row?.primary_attr);
    if (!row || id == null || !name || !localized || !attribute) return [];
    return [
      {
        id,
        localizedName: localized,
        shortName: name.replace(/^npc_dota_hero_/, ''),
        attribute,
        image: imageUrl(row.img),
      },
    ];
  });
  const items = Object.entries(asRecord(itemsRaw) ?? {}).flatMap(([key, entry]) => {
    const row = asRecord(entry);
    const id = asNumber(row?.id);
    if (!row || id == null || !key) return [];
    const stored = asString(row.name);
    const short = key.replace(/^item_/, '');
    const name = stored?.startsWith('item_') ? stored : `item_${short}`;
    return [{ id, name, localizedName: asString(row.dname) ?? name, image: imageUrl(row.img) }];
  });
  heroes.sort((left, right) => left.localizedName.localeCompare(right.localizedName, 'ru'));
  items.sort((left, right) => left.id - right.id);
  return { heroes, items };
}

/** Heroes and items used to name ids. */
export async function loadConstants(root: string): Promise<Catalog> {
  const file = path.join(dataDir(root), 'constants.json');
  const cached = readJson(file);
  const savedAt = asNumber(asRecord(cached)?.savedAt);
  if (cached && savedAt != null && Date.now() - savedAt < WEEK) {
    const catalog = mapConstants(asRecord(cached)?.heroes, asRecord(cached)?.items);
    if (catalog.heroes.length > 0) return catalog;
  }
  const limiter = new RateLimiter(1050);
  await limiter.wait();
  const heroes = await fetchJson(HEROES);
  await limiter.wait();
  const items = await fetchJson(ITEMS);
  ensureDir(dataDir(root));
  writeJson(file, { savedAt: Date.now(), heroes, items });
  return mapConstants(heroes, items);
}

/** Games and wins against one hero. */
export type Matchup = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Matches against this hero. */
  readonly games: number;

  /** Wins against this hero. */
  readonly wins: number;
};

/** Matchups for one hero. */
export async function loadMatchups(root: string, heroId: number): Promise<Matchup[]> {
  const file = path.join(cacheDir(root), `hero_${heroId}_matchups.json`);
  const cached = asRecord(readJson(file));
  const savedAt = asNumber(cached?.savedAt);
  if (cached && savedAt != null && Date.now() - savedAt < 24 * 60 * 60 * 1000) {
    return mapMatchups(cached.matchups);
  }
  const payload = await fetchJson(`https://api.opendota.com/api/heroes/${heroId}/matchups`);
  ensureDir(cacheDir(root));
  writeJson(file, { savedAt: Date.now(), heroId, matchups: payload });
  return mapMatchups(payload);
}

function mapMatchups(value: unknown): Matchup[] {
  return asArray(value).flatMap((entry) => {
    const row = asRecord(entry);
    const heroId = asNumber(row?.hero_id);
    const games = asNumber(row?.games_played);
    const wins = asNumber(row?.wins);
    if (!row || heroId == null || games == null || wins == null) return [];
    return [{ heroId, games, wins }];
  });
}

import type { GameCatalog, HeroInfo, ItemInfo, MatchPerformance, PlayerSnapshot } from '@/models';
import type { PlayerViewVm } from '@/view-models';
import { buildPlayerHeroes } from './build-player-heroes';
import { buildPlayerProfile } from './build-player-profile';

function indexes(catalog: GameCatalog | undefined): {
  readonly heroMap: Map<number, HeroInfo>;
  readonly itemMap: Map<number, ItemInfo>;
} {
  return {
    heroMap: new Map((catalog?.heroes ?? []).map((hero) => [hero.id, hero])),
    itemMap: new Map((catalog?.items ?? []).map((item) => [item.id, item])),
  };
}

/** Player page data for a snapshot and its matches. */
export function buildPlayerView(
  snapshot: PlayerSnapshot,
  rows: MatchPerformance[],
  catalog: GameCatalog | undefined,
): PlayerViewVm {
  const { heroMap, itemMap } = indexes(catalog);

  return {
    snapshot,
    ...buildPlayerProfile(snapshot),
    heroes: buildPlayerHeroes(snapshot, rows, heroMap),
    heroMap,
    itemMap,
    rows,
  };
}

import type { GameCatalog } from '@/models';
import type { CatalogDto } from '../../schemas/catalog/catalog.schema';

/** Hero and item constants. */
export function mapCatalog(dto: CatalogDto): GameCatalog {
  return {
    heroes: dto.heroes.map((hero) => ({ ...hero })),
    items: dto.items.map((item) => ({ ...item })),
  };
}

import type { GameCatalog } from '@/models';
import { api } from '../../http';
import { mapCatalog } from '../../mappers/catalog/map-catalog';
import { catalogSchema } from '../../schemas/catalog/catalog.schema';

/** Hero and item constants. */
export class CatalogApi {
  private request: Promise<GameCatalog> | null = null;

  /** Hero and item constants. */
  public load(): Promise<GameCatalog> {
    this.request ??= this.fetchCatalog();
    return this.request;
  }

  private async fetchCatalog(): Promise<GameCatalog> {
    try {
      const { data } = await api.get('/api/constants');
      return mapCatalog(catalogSchema.parse(data));
    } catch (error: unknown) {
      this.request = null;
      throw error;
    }
  }
}

/** Shared catalog client. */
export const catalogApi = new CatalogApi();

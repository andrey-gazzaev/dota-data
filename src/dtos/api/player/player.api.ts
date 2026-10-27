import type { LocalPlayer, MatchPerformance, PlayerSnapshot } from '@/models';
import { catalogApi } from '../catalog/catalog.api';
import { api, deleteQuiet, openEventStream } from '../../http';
import { mapLocalPlayer } from '../../mappers/player/map-local-player';
import { mapPerformances } from '../../mappers/player/map-performance';
import { mapPlayerSnapshot } from '../../mappers/player/map-player-snapshot';
import { readServerEvents, serverMessage } from '../../server-events';
import { estimateSchema, type EstimateDto } from '../../schemas/player/estimate.schema';
import { localPlayersSchema } from '../../schemas/player/local-players.schema';
import { performanceListSchema } from '../../schemas/player/performance-list.schema';
import { playerSnapshotSchema } from '../../schemas/player/player-snapshot.schema';
import { progressSchema, type ProgressDto } from '../../schemas/player/progress.schema';
import { refreshDoneSchema } from '../../schemas/player/refresh-done.schema';
import type { RefreshResultDto } from '../../schemas/player/refresh-result.schema';
import { requestLogSchema, type RequestLogDto } from '../../schemas/player/request-log.schema';

const emptyCatalog = { heroes: [], items: [] };

/** One player's snapshot, matches, local list, refresh, and match parses. */
export class PlayerApi {
  /** Saved profile, records, and hero totals for one account. */
  public async snapshot(accountId: number): Promise<PlayerSnapshot> {
    const { data } = await api.get(`/api/players/${accountId}`);
    return mapPlayerSnapshot(playerSnapshotSchema.parse(data));
  }

  /** Matches stored for one account. */
  public async performances(accountId: number): Promise<MatchPerformance[]> {
    const [payload, catalog] = await Promise.all([this.performanceList(accountId), this.catalog()]);
    return mapPerformances(payload.rows, catalog);
  }

  /** Accounts that already have a saved snapshot. */
  public async list(): Promise<LocalPlayer[]> {
    const { data } = await api.get('/api/players');
    return localPlayersSchema.parse(data).players.map(mapLocalPlayer);
  }

  /** Stops an in-progress refresh for this account. */
  public cancelRefresh(accountId: number): void {
    deleteQuiet(`/api/players/${accountId}/refresh`);
  }

  /** Refreshes the account and reports progress until it finishes. */
  public async refresh(
    accountId: number,
    handlers: {
      readonly onProgress: (event: ProgressDto) => void;
      readonly onLog: (event: RequestLogDto) => void;
      readonly onEstimate: (event: EstimateDto) => void;
    },
    signal?: AbortSignal,
  ): Promise<RefreshResultDto[]> {
    const response = await openEventStream(`/api/players/${accountId}/refresh`, { signal });
    if (!response.ok || !response.body) {
      throw new Error(`Обновление не запустилось (${response.status})`);
    }

    let results: RefreshResultDto[] | null = null;
    await readServerEvents(response.body, (event, json) => {
      if (event === 'progress') handlers.onProgress(progressSchema.parse(json));
      if (event === 'log') handlers.onLog(requestLogSchema.parse(json));
      if (event === 'estimate') handlers.onEstimate(estimateSchema.parse(json));
      if (event === 'done') results = refreshDoneSchema.parse(json).results;
      if (event === 'cancelled') throw new Error(serverMessage(json));
      if (event === 'error') throw new Error(serverMessage(json));
    });

    if (!results) throw new Error('Обновление оборвалось');

    return results;
  }

  /** Stops an in-progress match parse for this account. */
  public cancelDetails(accountId: number): void {
    deleteQuiet(`/api/players/${accountId}/details`);
  }

  /** Parses the given matches and reports progress. */
  public async details(
    accountId: number,
    matchIds: readonly number[],
    onProgress: (event: ProgressDto) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    const response = await openEventStream(`/api/players/${accountId}/details`, { body: { matchIds }, signal });
    if (!response.ok || !response.body) {
      const message = await errorMessage(response.body, `Разбор не запустился (${response.status})`);
      throw new Error(message);
    }

    await readServerEvents(response.body, (event, json) => {
      if (event === 'progress') onProgress(progressSchema.parse(json));
      if (event === 'cancelled') throw new Error(serverMessage(json));
      if (event === 'error') throw new Error(serverMessage(json));
    });
  }

  private async performanceList(accountId: number) {
    const { data } = await api.get(`/api/players/${accountId}/performances`);
    return performanceListSchema.parse(data);
  }

  private async catalog() {
    try {
      return await catalogApi.load();
    } catch {
      return emptyCatalog;
    }
  }
}

/** Shared player client. */
export const playerApi = new PlayerApi();

async function errorMessage(body: ReadableStream<Uint8Array> | null, fallback: string): Promise<string> {
  if (!body) return fallback;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    text += decoder.decode(chunk.value, { stream: true });
  }
  if (!text) return fallback;
  try {
    return serverMessage(JSON.parse(text) as unknown);
  } catch {
    return fallback;
  }
}

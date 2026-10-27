import axios, { isAxiosError } from 'axios';

/** HTTP client for the local API. */
export const api = axios.create({ withCredentials: true });

api.interceptors.response.use(undefined, (error: unknown) => {
  if (!isAxiosError(error) || error.code === 'ERR_CANCELED') return Promise.reject(error);
  const body: unknown = error.response?.data;
  const message =
    body && typeof body === 'object' && 'message' in body && typeof body.message === 'string' ? body.message : null;
  const status = error.response?.status;
  return Promise.reject(new Error(message ?? (status != null ? `Запрос не удался (${status})` : 'Запрос не удался')));
});

/** Sends a delete and ignores a failed response. */
export function deleteQuiet(url: string): void {
  void ignoreDelete(url);
}

async function ignoreDelete(url: string): Promise<void> {
  try {
    await api.delete(url);
  } catch {
    return;
  }
}

/** Opens a stream of progress events for a long request. */
export async function openEventStream(
  url: string,
  options: { readonly body?: unknown; readonly signal?: AbortSignal } = {},
): Promise<{ readonly ok: boolean; readonly status: number; readonly body: ReadableStream<Uint8Array> | null }> {
  const response = await api.request<ReadableStream<Uint8Array> | null>({
    url,
    method: 'POST',
    data: options.body,
    signal: options.signal,
    adapter: 'fetch',
    responseType: 'stream',
    validateStatus: () => true,
  });

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    body: response.data instanceof ReadableStream ? response.data : null,
  };
}

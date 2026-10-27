/** Reads progress events from a long request. */
export async function readServerEvents(
  body: ReadableStream<Uint8Array> | null,
  onEvent: (event: string, json: unknown) => void,
): Promise<void> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    buffer += decoder.decode(chunk.value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const event = /^event: (.+)$/m.exec(part)?.[1];
      const data = /^data: (.+)$/m.exec(part)?.[1];
      if (!event || !data) continue;
      onEvent(event, JSON.parse(data) as unknown);
    }
  }
}

/** Error text from a progress event, or a generic failure. */
export function serverMessage(json: unknown): string {
  if (json && typeof json === 'object' && 'message' in json && typeof json.message === 'string') {
    return json.message;
  }
  return 'Запрос прервался';
}

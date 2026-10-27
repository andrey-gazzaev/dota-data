/** The refresh or parse was stopped by the user. */
export class RefreshCancelled extends Error {
  /** Marks this error as a stop requested by the user. */
  public constructor() {
    super('Обновление отменено');
    this.name = 'RefreshCancelled';
  }
}

/** True when the error means the user stopped the work. */
export function isCancelled(error: unknown): boolean {
  return error instanceof RefreshCancelled || (error instanceof Error && error.name === 'AbortError');
}

/** Stops the current work when the user has cancelled it. */
export function throwIfCancelled(signal: AbortSignal): void {
  if (signal.aborted) throw new RefreshCancelled();
}

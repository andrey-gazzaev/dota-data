import { AsyncLocalStorage } from 'node:async_hooks';

/** Pause between outbound requests, in milliseconds. */
export const REQUEST_PACE_MS = 1_200;

/** One outbound request shown in the refresh log. */
export type RequestLog = {
  /** Id of this request in the current refresh. */
  readonly id: number;

  /** HTTP method. */
  readonly method: string;

  /** Short name of the request. */
  readonly target: string;

  /** HTTP status. Empty until the request ends. */
  readonly status: number | null;

  /** Duration in milliseconds. Empty until the request ends. */
  readonly ms: number | null;

  /** Extra note. Empty when there is nothing to add. */
  readonly note: string | null;
};

/** How many requests a refresh still expects. */
export type Estimate = {
  /** Remaining wait in milliseconds. */
  readonly remainingMs: number;

  /** Requests that have finished. */
  readonly done: number;

  /** Requests this refresh expects to make. */
  readonly planned: number;

  /** True once the number of match parses is known. */
  readonly detailsKnown: boolean;
};

/** Where request events are reported. */
type Sink = {
  /** Called when a request is logged or updated. */
  readonly onLog: (entry: RequestLog) => void;

  /** Called when the remaining-time estimate changes. */
  readonly onEstimate: (entry: Estimate) => void;
};

class RequestTracer {
  private seq = 0;
  private planned = 0;
  private done = 0;
  private holdUntil = 0;
  private detailsKnown = false;
  private phase: {
    /** Requests this stretch expects. */
    readonly planned: number;

    /** Requests this stretch has finished. */
    readonly done: number;
  } | null = null;
  private readonly rows = new Map<number, RequestLog>();

  /** Where request events are reported. */
  public constructor(private readonly sink: Sink) {}

  /** Starts a stretch of requests that share one expected count. */
  public beginPhase(): void {
    this.closePhase();
    this.phase = { planned: 0, done: 0 };
  }

  /** Ends the current stretch of requests. */
  public closePhase(): void {
    if (!this.phase) return;
    const unused = Math.max(0, this.phase.planned - this.phase.done);
    this.planned = Math.max(this.done, this.planned - unused);
    this.phase = null;
    this.publish();
  }

  /** How many requests this stretch still includes. */
  public expect(count: number): void {
    if (count <= 0) return;
    this.planned += count;
    if (this.phase) this.phase = { planned: this.phase.planned + count, done: this.phase.done };
    this.publish();
  }

  /** Adds match parses to the expected count. */
  public revealDetails(count: number): void {
    this.detailsKnown = true;
    this.expect(count);
    if (count <= 0) this.publish();
  }

  /** Extra wait before the next request. */
  public hold(ms: number): void {
    this.holdUntil = Math.max(this.holdUntil, Date.now() + ms);
    this.publish();
  }

  /** Notes that a request has started. */
  public begin(method: string, target: string): number {
    const id = ++this.seq;
    const row: RequestLog = { id, method, target, status: null, ms: null, note: null };
    this.rows.set(id, row);
    this.sink.onLog(row);
    return id;
  }

  /** Notes how a request ended. */
  public finish(id: number, status: number | null, ms: number, counts: boolean, note: string | null): void {
    const row = this.rows.get(id);
    if (!row) return;
    const next: RequestLog = { ...row, status, ms, note };
    this.rows.set(id, next);
    this.sink.onLog(next);
    if (counts) {
      this.done += 1;
      this.holdUntil = 0;
      if (this.phase) this.phase = { planned: this.phase.planned, done: this.phase.done + 1 };
    }
    this.publish();
  }

  private publish(): void {
    const left = Math.max(0, this.planned - this.done);
    const hold = Math.max(0, this.holdUntil - Date.now());
    this.sink.onEstimate({
      remainingMs: Math.round(hold + left * REQUEST_PACE_MS),
      done: this.done,
      planned: this.planned,
      detailsKnown: this.detailsKnown,
    });
  }
}

const storage = new AsyncLocalStorage<RequestTracer>();

/** Runs work while recording its outbound requests. */
export function withRequestTrace<T>(sink: Sink, run: () => Promise<T>): Promise<T> {
  return storage.run(new RequestTracer(sink), run);
}

/** Starts a stretch of requests that share one expected count. */
export function beginPhase(): void {
  storage.getStore()?.beginPhase();
}

/** Ends the current stretch of requests. */
export function closePhase(): void {
  storage.getStore()?.closePhase();
}

/** How many requests this stretch still includes. */
export function expectRequests(count: number): void {
  storage.getStore()?.expect(count);
}

/** Adds match parses to the expected count. */
export function expectDetails(count: number): void {
  storage.getStore()?.revealDetails(count);
}

/** Extra wait before the next request. */
export function holdRequests(ms: number): void {
  storage.getStore()?.hold(ms);
}

/** Notes that a request has started. Empty when nothing is being recorded. */
export function traceBegin(method: string, target: string): number | null {
  return storage.getStore()?.begin(method, target) ?? null;
}

/** Notes how a request ended. */
export function traceFinish(
  id: number | null,
  status: number | null,
  ms: number,
  counts: boolean,
  note: string | null,
): void {
  if (id == null) return;
  storage.getStore()?.finish(id, status, ms, counts, note);
}

import { describe, expect, it } from 'vitest';
import {
  REQUEST_PACE_MS,
  beginPhase,
  closePhase,
  expectDetails,
  expectRequests,
  holdRequests,
  traceBegin,
  traceFinish,
  withRequestTrace,
  type Estimate,
} from './trace';

describe('request trace', () => {
  it('counts planned calls and drops the ones a phase did not send', async () => {
    const estimates: Estimate[] = [];
    await withRequestTrace(
      {
        onLog: () => undefined,
        onEstimate: (entry) => estimates.push(entry),
      },
      async () => {
        beginPhase();
        expectRequests(3);
        const id = traceBegin('GET', '/players/1');
        traceFinish(id, 200, 80, true, null);
        expectDetails(10);
        closePhase();
      },
    );
    expect(estimates.at(-2)).toMatchObject({
      done: 1,
      planned: 13,
      detailsKnown: true,
      remainingMs: 12 * REQUEST_PACE_MS,
    });
    expect(estimates.at(-1)).toMatchObject({ done: 1, planned: 1, remainingMs: 0 });
  });

  it('keeps a rate-limit retry in the plan and adds the pause', async () => {
    const estimates: Estimate[] = [];
    await withRequestTrace(
      {
        onLog: () => undefined,
        onEstimate: (entry) => estimates.push(entry),
      },
      async () => {
        beginPhase();
        expectRequests(1);
        const blocked = traceBegin('GET', '/matches/1');
        traceFinish(blocked, 429, 40, false, null);
        holdRequests(60_000);
        const retry = traceBegin('GET', '/matches/1');
        traceFinish(retry, 200, 90, true, null);
        closePhase();
      },
    );
    const afterPause = estimates.find((entry) => entry.remainingMs >= 60_000);
    expect(afterPause?.done).toBe(0);
    expect(afterPause?.planned).toBe(1);
    expect(estimates.at(-1)).toMatchObject({ done: 1, planned: 1, remainingMs: 0 });
  });
});

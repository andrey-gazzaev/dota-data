import { describe, expect, it } from 'vitest';
import { mergeById, mergeMatchDetails } from './merge';

const good = (matchId: number, accountId: number) => ({
  match_id: matchId,
  data: { players: [{ account_id: accountId }] },
});

describe('mergeMatchDetails', () => {
  it('keeps old successful details and replaces a failed one', () => {
    const merged = mergeMatchDetails(
      [{ match_id: 1, data: { error: 'fetch failed' } }, good(2, 5), good(4, 5)],
      [good(1, 5), good(2, 9), good(3, 5)],
    );
    const byId = new Map(merged.map((row) => [row.match_id, row]));
    expect(byId.get(1)?.data).toEqual({ players: [{ account_id: 5 }] });
    expect(byId.get(2)?.data).toEqual({ players: [{ account_id: 5 }] });
    expect(byId.get(3)?.data).toEqual({ players: [{ account_id: 5 }] });
    expect(byId.has(4)).toBe(true);
    expect(merged).toHaveLength(4);
  });
});

describe('mergeById', () => {
  it('keeps summaries that disappeared from a short history window', () => {
    const merged = mergeById(
      [
        { match_id: 1, kills: 2 },
        { match_id: 2, kills: 4 },
      ],
      [
        { match_id: 2, kills: 9 },
        { match_id: 3, kills: 1 },
      ],
      (row) => (row && typeof row === 'object' && 'match_id' in row ? Number(row.match_id) : null),
    );
    expect(merged).toEqual([
      { match_id: 1, kills: 2 },
      { match_id: 2, kills: 9 },
      { match_id: 3, kills: 1 },
    ]);
  });
});

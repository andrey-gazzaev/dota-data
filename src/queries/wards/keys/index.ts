/** Cache keys for a player's match list and ward marks. */
export const wardKeys = {
  all: ['wards'] as const,
  account: (accountId: number) => ['wards', accountId] as const,
  matches: (accountId: number) => ['wards', accountId, 'matches'] as const,
  match: (accountId: number, matchId: number | null) => ['wards', accountId, matchId] as const,
};

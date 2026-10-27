/** Cache keys for a player snapshot, their matches, and the local account list. */
export const playerKeys = {
  all: ['player'] as const,
  list: ['player', 'list'] as const,
  detail: (accountId: number) => ['player', accountId] as const,
  performances: (accountId: number) => ['player', accountId, 'performances'] as const,
};

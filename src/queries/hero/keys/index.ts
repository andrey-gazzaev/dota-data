/** Cache keys for STRATZ hero meta and the OpenDota matchup list. */
export const heroKeys = {
  all: ['hero'] as const,
  meta: (rank: string) => [...heroKeys.all, 'meta', rank] as const,
  matchups: (heroId: number) => ['hero', 'matchups', heroId] as const,
};

/** Cache keys for a player search. */
export const searchKeys = {
  all: ['search'] as const,
  text: (query: string) => ['search', query] as const,
};

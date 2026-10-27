import type { RecentSourceVm } from '@/view-models';
import { useRecentParse } from './use-recent-parse';
import { useRecentRows } from './use-recent-rows';

/** Recent matches, and a way to parse the ones that have no lineup. */
export function useRecentMatches(accountId: number, heroId: number | null, source: RecentSourceVm) {
  const matches = useRecentRows(heroId, source);
  const parse = useRecentParse(accountId, matches.missing, matches.matches.length);
  return {
    matches: { isLoading: matches.isLoading, heroes: matches.heroes, matches: matches.matches },
    parse,
  };
}

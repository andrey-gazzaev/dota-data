import { useMemo } from 'react';
import { useHeroMetas } from '@/queries';
import type { HeroMeta } from '@/models';
import { DraftOdds } from '@/services';

/** Pairs below this many games are left out of a draft or matchup score. */
export const MIN_PAIR_GAMES = 100;

const EMPTY_METAS = new Map<number, HeroMeta>();

/** Matchup tables for one rank, and the scorer that uses them. */
export function useDraftTables(rank: string) {
  const metas = useHeroMetas(rank);
  const tables = metas.data ?? EMPTY_METAS;
  const odds = useMemo(() => new DraftOdds(tables, MIN_PAIR_GAMES), [tables]);
  return { odds, pending: metas.isPending, error: metas.error };
}

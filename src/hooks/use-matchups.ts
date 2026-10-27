import type { MatchupSourceVm } from '@/view-models';
import { useMatchupBoard, type MatchupBoard } from './use-matchup-board';
import { useMatchupHeroes, type MatchupHeroes } from './use-matchup-heroes';

/** Heroes to pick and the matchups of the selected one. */
export function useMatchups(
  heroId: number | null,
  source: MatchupSourceVm,
): { readonly heroes: MatchupHeroes; readonly board: MatchupBoard } {
  const heroes = useMatchupHeroes(heroId, source);
  const board = useMatchupBoard(heroes.selected, source.heroMap);
  return { heroes, board };
}

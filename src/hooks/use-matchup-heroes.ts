import type { MatchupClassVm, MatchupHeroVm, MatchupSourceVm } from '@/view-models';
import { useHeroClasses } from './use-hero-classes';

/** Heroes to pick, and which one is open. */
export type MatchupHeroes = {
  /** True while the player snapshot is loading. */
  readonly isLoading: boolean;

  /** Load error for the player snapshot. Empty when it loaded. */
  readonly error: string | null;

  /** Heroes the player can open, most played first. */
  readonly heroes: readonly MatchupHeroVm[];

  /** Heroes grouped by attribute. */
  readonly classes: readonly MatchupClassVm[];

  /** Open hero. The most played hero when the page has no selection. */
  readonly selected: number | null;
};

/** Heroes to pick on the matchup page. */
export function useMatchupHeroes(heroId: number | null, source: MatchupSourceVm): MatchupHeroes {
  const { heroes, classes } = useHeroClasses(source.heroes);
  return {
    isLoading: source.isLoading,
    error: source.error,
    heroes,
    classes,
    selected: heroId ?? heroes[0]?.id ?? null,
  };
}

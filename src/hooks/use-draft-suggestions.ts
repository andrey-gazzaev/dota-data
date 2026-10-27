import { useMemo, useState } from 'react';
import { formatWinRate } from '@/services';
import type { DraftSuggestionsVm } from '@/view-models';
import type { DraftSelection } from './use-draft-picks';
import type { useDraftTables } from './use-draft-tables';

const SLOTS = 5;
const SUGGEST_LIMIT = 5;

function pointsLabel(next: number, current: number | null): string | null {
  if (current == null) return null;
  const points = Math.round((next - current) * 1000) / 10;
  const sign = points > 0 ? '+' : '';
  return `${sign}${points.toFixed(1)}`;
}

/** Heroes that most raise the allied win chance. */
export function useDraftSuggestions(
  selection: DraftSelection,
  score: ReturnType<typeof useDraftTables>,
  chanceValue: number | null,
): DraftSuggestionsVm {
  const { allies, enemies, heroes, picked, heroMap, addAlly } = selection;
  const [suggesting, setSuggesting] = useState(false);

  const suggestionPending = suggesting && score.pending;
  const candidateIds = useMemo(() => {
    if (!suggesting || allies.length >= SLOTS) return [];
    const takenIds = new Set(picked);
    return heroes.flatMap((hero) => (takenIds.has(hero.id) ? [] : [hero.id]));
  }, [suggesting, allies.length, heroes, picked]);
  const recommendations = useMemo(() => {
    if (!suggesting || suggestionPending || allies.length >= SLOTS) return [];
    return score.odds.recommend(allies, enemies, candidateIds, SLOTS, SUGGEST_LIMIT);
  }, [suggesting, suggestionPending, allies, enemies, score.odds, candidateIds]);

  function askSuggestion() {
    setSuggesting(true);
  }

  const suggestions = recommendations.map((pick) => {
    const hero = heroMap?.get(pick.heroId);
    return {
      id: pick.heroId,
      name: hero?.localizedName ?? `Герой ${pick.heroId}`,
      image: hero?.image ?? '',
      chance: formatWinRate(pick.chance),
      delta: pointsLabel(pick.chance, chanceValue),
    };
  });

  return {
    askSuggestion,
    takeSuggestion: addAlly,
    canSuggest: allies.length < SLOTS && picked.length > 0,
    suggesting,
    suggestionPending,
    suggestions,
  };
}

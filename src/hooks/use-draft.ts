import type { DraftSourceVm, DraftViewVm } from '@/view-models';
import { useDraftChance } from './use-draft-chance';
import { useDraftPicks } from './use-draft-picks';
import { useDraftSuggestions } from './use-draft-suggestions';
import { useDraftTables } from './use-draft-tables';

/** Draft picks, win chance, and suggested heroes. */
export function useDraft(source: DraftSourceVm): DraftViewVm {
  const picks = useDraftPicks(source);
  const score = useDraftTables(picks.selection.rank);
  const chance = useDraftChance(picks.selection, score);
  const suggestions = useDraftSuggestions(picks.selection, score, chance.chanceValue);
  return { picks: picks.view, chance, suggestions };
}

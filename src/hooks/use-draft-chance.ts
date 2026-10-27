import { useMemo } from 'react';
import { formatPlural, formatWinRate, type DraftSample, type DraftTerm } from '@/services';
import type { DraftChanceVm, DraftPairViewVm } from '@/view-models';
import type { DraftSelection } from './use-draft-picks';
import type { useDraftTables } from './use-draft-tables';

function gamesLabel(games: number): string {
  return formatPlural(games, ['пара', 'пары', 'пар']);
}

/** Allied win chance for the current picks. */
export function useDraftChance(selection: DraftSelection, score: ReturnType<typeof useDraftTables>): DraftChanceVm {
  const { allies, enemies, picked, heroMap } = selection;
  const loading = picked.length > 0 && score.pending;
  const estimate = useMemo(() => {
    if (loading) return null;

    return score.odds.chance(allies, enemies);
  }, [loading, allies, enemies, score.odds]);
  const metaError = score.error;

  function pairView(sample: DraftSample | null, join: string): DraftPairViewVm | null {
    if (!sample || !heroMap) return null;
    const left = heroMap.get(sample.leftId)?.localizedName ?? `Герой ${sample.leftId}`;
    const right = heroMap.get(sample.rightId)?.localizedName ?? `Герой ${sample.rightId}`;
    const value = sample.games > 0 ? sample.wins / sample.games : null;

    return {
      label: `${left} ${join} ${right}`,
      rate: formatWinRate(value),
      gamesLabel: formatPlural(sample.games, ['игра', 'игры', 'игр']),
    };
  }

  function termLine(title: string, term: DraftTerm | null): string {
    if (!term) return `${title}: нет пар`;

    return `${title}: ${formatWinRate(term.rate)} · ${gamesLabel(term.pairs)}`;
  }

  return {
    isMetaLoading: loading,
    metaError: metaError instanceof Error ? metaError.message : null,
    chance: formatWinRate(estimate?.chance ?? null),
    chanceValue: estimate?.chance ?? null,
    counterLine: termLine('Контрпики', estimate?.counters ?? null),
    allyLine: termLine('Наша синергия', estimate?.allySynergy ?? null),
    enemyLine: termLine('Их синергия', estimate?.enemySynergy ?? null),
    worst: pairView(estimate?.worstCounter ?? null, 'против'),
    best: pairView(estimate?.bestSynergy ?? null, '+'),
  };
}

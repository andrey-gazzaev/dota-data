import { useMemo, useState } from 'react';
import type { DraftHeroVm, DraftPicksVm, DraftSideVm, DraftSlotVm, DraftSourceVm } from '@/view-models';
import { useHeroClasses } from './use-hero-classes';
import { useRankGroup } from './use-rank-group';

const SLOTS = 5;

function slotsOf(heroMap: DraftSourceVm['heroMap'], ids: readonly number[]): DraftSlotVm[] {
  const filled = ids.map((id) => {
    const hero = heroMap?.get(id);
    return { id, name: hero?.localizedName ?? `Герой ${id}`, image: hero?.image ?? '' };
  });

  return [...filled, ...Array.from({ length: SLOTS - filled.length }, () => null)];
}

/** Picks the win chance and suggestions are scored from. */
export type DraftSelection = {
  /** Rank group the matchup tables use. */
  readonly rank: DraftPicksVm['rank'];

  /** Allied hero ids. */
  readonly allies: readonly number[];

  /** Enemy hero ids. */
  readonly enemies: readonly number[];

  /** Hero ids picked on either side. */
  readonly picked: readonly number[];

  /** Heroes the player can add. */
  readonly heroes: readonly DraftHeroVm[];

  /** Catalog heroes by id. Empty when the catalog has not loaded. */
  readonly heroMap: DraftSourceVm['heroMap'];

  /** Adds a hero to the allied side and clears it from the enemy side. */
  readonly addAlly: (id: number) => void;
};

/** Picks ready to show, and the ids the other draft hooks score. */
type DraftPicksState = {
  /** Picks, rank, and hero groups ready to show. */
  readonly view: DraftPicksVm;

  /** Picks the win chance and suggestions are scored from. */
  readonly selection: DraftSelection;
};

/** Heroes picked on each side, and the rank they are scored at. */
export function useDraftPicks(source: DraftSourceVm): DraftPicksState {
  const heroMap = source.heroMap;
  const { heroes, classes } = useHeroClasses(source.heroes);
  const { ranks, rank, setRank, rankCaption } = useRankGroup();
  const [side, setSide] = useState<DraftSideVm>('allies');
  const [allies, setAllies] = useState<number[]>([]);
  const [enemies, setEnemies] = useState<number[]>([]);

  const picked = useMemo(() => [...new Set([...allies, ...enemies])], [allies, enemies]);
  const taken = new Set(picked);

  function toggleHero(id: number) {
    if (taken.has(id)) {
      setAllies((current) => current.filter((heroId) => heroId !== id));
      setEnemies((current) => current.filter((heroId) => heroId !== id));
      return;
    }

    const update = side === 'allies' ? setAllies : setEnemies;
    update((current) => (current.length >= SLOTS ? current : [...current, id]));
  }

  function removeHero(id: number) {
    setAllies((current) => current.filter((heroId) => heroId !== id));
    setEnemies((current) => current.filter((heroId) => heroId !== id));
  }

  function addAlly(id: number) {
    setSide('allies');
    setEnemies((current) => current.filter((heroId) => heroId !== id));
    setAllies((current) => (current.includes(id) || current.length >= SLOTS ? current : [...current, id]));
  }

  const view: DraftPicksVm = {
    isLoading: source.isLoading,
    error: source.error,
    classes,
    ranks,
    rank,
    setRank,
    rankCaption,
    side,
    setSide,
    alliesFull: allies.length >= SLOTS,
    enemiesFull: enemies.length >= SLOTS,
    taken,
    allySlots: slotsOf(heroMap, allies),
    enemySlots: slotsOf(heroMap, enemies),
    toggleHero,
    removeHero,
    hasPicks: picked.length > 0,
  };

  const selection: DraftSelection = { rank, allies, enemies, picked, heroes, heroMap, addAlly };

  return { view, selection };
}

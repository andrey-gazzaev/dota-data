import { useMemo } from 'react';

const HERO_CLASSES = [
  { id: 'str', title: 'Сила' },
  { id: 'agi', title: 'Ловкость' },
  { id: 'int', title: 'Интеллект' },
  { id: 'all', title: 'Универсальные' },
] as const;

/** A catalog hero before it is listed by id. */
type ClassSource = {
  /** Hero id in the Dota catalog. */
  readonly heroId: number;

  /** Display name. */
  readonly name: string;

  /** Matches on this hero. */
  readonly games: number;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Primary attribute. `all` means a universal hero. */
  readonly attribute: 'str' | 'agi' | 'int' | 'all';
};

/** A hero listed for picking, most played first. */
type ListedHero = {
  /** Hero id in the Dota catalog. */
  readonly id: number;

  /** Display name. */
  readonly name: string;

  /** Matches on this hero. */
  readonly games: number;

  /** Portrait URL. Empty when the catalog has no image. */
  readonly image: string;

  /** Primary attribute. `all` means a universal hero. */
  readonly attribute: ClassSource['attribute'];
};

/** Heroes sorted by games, grouped by attribute. Empty groups are left out. */
export function useHeroClasses(source: readonly ClassSource[] | undefined): {
  readonly heroes: ListedHero[];
  readonly classes: { readonly id: string; readonly title: string; readonly heroes: ListedHero[] }[];
} {
  const heroes = useMemo((): ListedHero[] => {
    return [...(source ?? [])]
      .sort((left, right) => right.games - left.games || left.name.localeCompare(right.name, 'ru'))
      .map((hero) => ({
        id: hero.heroId,
        name: hero.name,
        games: hero.games,
        image: hero.image,
        attribute: hero.attribute,
      }));
  }, [source]);

  const classes = useMemo(() => {
    return HERO_CLASSES.flatMap((heroClass) => {
      const group = heroes.filter((hero) => hero.attribute === heroClass.id);
      if (group.length === 0) return [];

      return [{ id: heroClass.id, title: heroClass.title, heroes: group }];
    });
  }, [heroes]);

  return { heroes, classes };
}

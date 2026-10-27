import { memo, useState } from 'react';
import { GroupTitle, TextField, ThumbGrid } from '@/ui';
import type { DraftClassVm } from '@/view-models';
import { HeroPick } from './hero-pick';
import styles from './draft-heroes.module.css';

function visibleClasses(classes: readonly DraftClassVm[], needle: string): DraftClassVm[] {
  return classes.flatMap((heroClass) => {
    const heroes = needle
      ? heroClass.heroes.filter((hero) => hero.name.toLocaleLowerCase('ru').includes(needle))
      : heroClass.heroes;

    return heroes.length > 0 ? [{ ...heroClass, heroes }] : [];
  });
}

const draftHeroesComponent = function DraftHeroesComponent({
  classes,
  taken,
  onToggle,
}: {
  readonly classes: readonly DraftClassVm[];
  readonly taken: ReadonlySet<number>;
  readonly onToggle: (id: number) => void;
}) {
  const [query, setQuery] = useState('');

  const needle = query.trim().toLocaleLowerCase('ru');
  const groups = visibleClasses(classes, needle);

  return (
    <>
      <label className={styles.search}>
        <span className="sr">Поиск героя</span>
        <TextField
          type="search"
          width="compact"
          value={query}
          placeholder="Поиск героя"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      {needle && groups.length === 0 ? <p className="status">Такого героя нет</p> : null}
      {groups.map((heroClass) => (
        <section key={heroClass.id} aria-label={heroClass.title}>
          <GroupTitle>{heroClass.title}</GroupTitle>
          <ThumbGrid role="list">
            {heroClass.heroes.map((hero) => (
              <HeroPick key={hero.id} hero={hero} taken={taken.has(hero.id)} onToggle={onToggle} />
            ))}
          </ThumbGrid>
        </section>
      ))}
    </>
  );
};
draftHeroesComponent.displayName = 'DraftHeroes';
/** Hero search and the attribute groups the player can pick from. */
export const DraftHeroes = memo(draftHeroesComponent);

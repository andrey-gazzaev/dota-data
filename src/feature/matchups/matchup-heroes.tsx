import { memo, useState } from 'react';
import { GroupTitle, TextField, ThumbGrid } from '@/ui';
import type { MatchupClassVm } from '@/view-models';
import { HeroPick } from './hero-pick';
import styles from './matchup-heroes.module.css';

function visibleClasses(classes: readonly MatchupClassVm[], needle: string): MatchupClassVm[] {
  return classes.flatMap((heroClass) => {
    const heroes = needle
      ? heroClass.heroes.filter((hero) => hero.name.toLocaleLowerCase('ru').includes(needle))
      : heroClass.heroes;

    return heroes.length > 0 ? [{ ...heroClass, heroes }] : [];
  });
}

const matchupHeroesComponent = function MatchupHeroesComponent({
  accountId,
  classes,
  selected,
}: {
  readonly accountId: number;
  readonly classes: readonly MatchupClassVm[];
  readonly selected: number | null;
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
              <HeroPick key={hero.id} accountId={accountId} hero={hero} selected={hero.id === selected} />
            ))}
          </ThumbGrid>
        </section>
      ))}
    </>
  );
};
matchupHeroesComponent.displayName = 'MatchupHeroes';
/** Hero search and the attribute groups that open matchups. */
export const MatchupHeroes = memo(matchupHeroesComponent);

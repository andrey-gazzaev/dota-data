import { memo, useState } from 'react';
import { usePlayerDataContext } from '@/context';
import { useRecentMatches } from '@/hooks';
import { Panel, Pill, Pills, SelectField } from '@/ui';
import { MatchList } from './match-list';
import styles from './recent-matches.module.css';

const recentMatchesComponent = function RecentMatchesComponent({ heroId = null }: { readonly heroId?: number | null }) {
  const player = usePlayerDataContext();
  const [tab, setTab] = useState<'recent' | 'hero'>(heroId == null ? 'recent' : 'hero');
  const [heroPick, setHeroPick] = useState<number | null>(heroId);

  const view = player.view;
  const activeHero = tab === 'recent' ? null : heroPick;
  const { matches, parse } = useRecentMatches(player.accountId, activeHero, {
    isLoading: player.isLoading,
    rows: view?.rows,
    heroMap: view?.heroMap,
    itemMap: view?.itemMap,
    heroes: view?.heroes,
  });
  const showList = tab === 'recent' || heroPick != null;

  return (
    <Panel aria-label="Матчи">
      <h2>Матчи</h2>
      <Pills className={styles.tabs} role="tablist">
        <Pill role="tab" aria-selected={tab === 'recent'} onClick={() => setTab('recent')}>
          Последние игры
        </Pill>
        <Pill role="tab" aria-selected={tab === 'hero'} onClick={() => setTab('hero')}>
          На герое
        </Pill>
      </Pills>

      {tab === 'hero' ? (
        <label className={styles.hero}>
          Герой
          <SelectField
            value={heroPick ?? ''}
            onChange={(event) => {
              const next = Number(event.target.value);
              setHeroPick(Number.isSafeInteger(next) && next > 0 ? next : null);
            }}
          >
            <option value="">Выберите героя</option>
            {matches.heroes.map((hero) => (
              <option key={hero.id} value={hero.id}>
                {hero.name} · {hero.games}
              </option>
            ))}
          </SelectField>
        </label>
      ) : null}

      <MatchList
        key={tab === 'hero' ? `hero-${heroPick ?? 'none'}` : 'recent'}
        showList={showList}
        isLoading={matches.isLoading}
        matches={matches.matches}
        parse={parse}
      />
    </Panel>
  );
};
recentMatchesComponent.displayName = 'RecentMatches';
/** Recent matches, with a parse for ones that have no lineup yet. */
export const RecentMatches = memo(recentMatchesComponent);

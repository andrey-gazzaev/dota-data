import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useMatchups } from '@/hooks';
import { Panel, Pill, Pills, Split } from '@/ui';
import type { MatchupSourceVm } from '@/view-models';
import { MatchupColumn } from './matchup-column';
import { MatchupHeroes } from './matchup-heroes';
import styles from './matchups.module.css';

const matchupsComponent = function MatchupsComponent({
  accountId,
  heroId,
  ...source
}: { readonly accountId: number; readonly heroId: number | null } & MatchupSourceVm) {
  const { heroes, board } = useMatchups(heroId, source);
  const ready = !board.isMetaLoading && heroes.selected != null && !board.metaError;

  return (
    <Panel aria-label="Контрпики и синергия">
      <p className="muted">
        <Link to={`/player/${accountId}`}>К игроку</Link>
      </p>
      <h1>Контрпики и синергия</h1>
      <p className="muted">Общая статистика STRATZ, {board.rankCaption}.</p>

      {heroes.isLoading ? <p className="status">Загружаем героев…</p> : null}
      {board.isMetaLoading ? <p className="status">Загружаем мету…</p> : null}
      {heroes.error ? <p className="status">{heroes.error}</p> : null}
      {board.metaError ? <p className="status">{board.metaError}</p> : null}

      <Pills className={styles.filters} role="group" aria-label="Ранг">
        {board.ranks.map((item) => (
          <Pill key={item.id} aria-pressed={item.id === board.rank} onClick={() => board.setRank(item.id)}>
            {item.label}
          </Pill>
        ))}
      </Pills>

      <MatchupHeroes accountId={accountId} classes={heroes.classes} selected={heroes.selected} />

      {heroes.selected != null && !board.isMetaLoading && !board.metaError ? (
        <p className="muted">
          {board.heroName}: пары от {board.minGamesLabel}.
        </p>
      ) : null}

      <Split>
        <MatchupColumn
          title="Контрпики"
          note="Самый низкий винрейт против этого героя."
          rows={board.counters}
          empty="В мете нет пар с таким числом игр"
          ready={ready}
        />
        <MatchupColumn
          title="Синергия"
          note="Самый высокий винрейт вместе с этим союзником."
          rows={board.synergies}
          empty="В мете нет пар с таким числом игр"
          ready={ready}
        />
      </Split>
    </Panel>
  );
};
matchupsComponent.displayName = 'Matchups';
/** Pick a hero and see who they beat or lose to. */
export const Matchups = memo(matchupsComponent);

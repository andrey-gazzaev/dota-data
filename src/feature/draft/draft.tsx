import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useDraft } from '@/hooks';
import { Panel, Pill, Pills } from '@/ui';
import type { DraftSourceVm } from '@/view-models';
import { DraftHeroes } from './draft-heroes';
import { DraftResult } from './draft-result';
import { DraftSuggestion } from './draft-suggestion';
import { DraftTeam } from './draft-team';
import styles from './draft.module.css';

const draftComponent = function DraftComponent({
  accountId,
  ...source
}: { readonly accountId: number } & DraftSourceVm) {
  const { picks, chance, suggestions } = useDraft(source);
  const sideFull = picks.side === 'allies' ? picks.alliesFull : picks.enemiesFull;

  return (
    <Panel aria-label="Шанс победы драфта">
      <p className="muted">
        <Link to={`/player/${accountId}`}>К игроку</Link>
      </p>
      <h1>Шанс победы драфта</h1>
      <p className="muted">Оценка по парам STRATZ, {picks.rankCaption}. Это не вероятность конкретного пика.</p>

      {picks.isLoading ? <p className="status">Загружаем героев…</p> : null}
      {picks.error ? <p className="status">{picks.error}</p> : null}
      {chance.metaError ? <p className="status">{chance.metaError}</p> : null}

      <Pills className={styles.filters} role="group" aria-label="Ранг">
        {picks.ranks.map((item) => (
          <Pill key={item.id} aria-pressed={item.id === picks.rank} onClick={() => picks.setRank(item.id)}>
            {item.label}
          </Pill>
        ))}
      </Pills>

      <div className={styles.sides}>
        <DraftTeam
          title="Мы"
          active={picks.side === 'allies'}
          slots={picks.allySlots}
          onActivate={() => picks.setSide('allies')}
          onRemove={picks.removeHero}
        />
        <DraftTeam
          title="Они"
          active={picks.side === 'enemies'}
          slots={picks.enemySlots}
          onActivate={() => picks.setSide('enemies')}
          onRemove={picks.removeHero}
        />
      </div>

      <DraftResult view={chance} hasPicks={picks.hasPicks} />
      <DraftSuggestion view={suggestions} alliesFull={picks.alliesFull} hasPicks={picks.hasPicks} />
      {sideFull ? <p className="muted">В выбранной команде уже пять героев.</p> : null}

      <DraftHeroes classes={picks.classes} taken={picks.taken} onToggle={picks.toggleHero} />
    </Panel>
  );
};
draftComponent.displayName = 'Draft';
/** Pick a draft and see the win chance. */
export const Draft = memo(draftComponent);

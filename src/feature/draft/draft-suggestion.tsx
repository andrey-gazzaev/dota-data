import { memo } from 'react';
import { Button } from '@/ui';
import type { DraftSuggestionsVm } from '@/view-models';
import styles from './draft.module.css';

const draftSuggestionComponent = function DraftSuggestionComponent({
  view,
  alliesFull,
  hasPicks,
}: {
  readonly view: DraftSuggestionsVm;
  readonly alliesFull: boolean;
  readonly hasPicks: boolean;
}) {
  if (alliesFull || (!view.canSuggest && !view.suggesting)) return null;
  if (!view.suggesting) {
    return (
      <Button className={styles.suggestButton} onClick={view.askSuggestion}>
        Предложить героев
      </Button>
    );
  }
  if (!hasPicks) return <p className="status">Сначала выберите хотя бы одного героя.</p>;
  if (view.suggestionPending) return <p className="status">Ищем героев…</p>;
  if (view.suggestions.length === 0) return <p className="status">Нет героев с парами от ста игр.</p>;

  return (
    <div className={styles.options}>
      <p className="muted">Лучшие варианты</p>
      {view.suggestions.map((pick) => (
        <div key={pick.id} className={styles.suggest}>
          {pick.image ? <img src={pick.image} alt="" width={72} height={40} /> : null}
          <p>
            {pick.name} · {pick.chance}
            {pick.delta ? ` · ${pick.delta}` : ''}
          </p>
          <Button className={styles.suggestButton} onClick={() => view.takeSuggestion(pick.id)}>
            Взять к нам
          </Button>
        </div>
      ))}
    </div>
  );
};
draftSuggestionComponent.displayName = 'DraftSuggestion';
/** Heroes that most help the current draft. */
export const DraftSuggestion = memo(draftSuggestionComponent);

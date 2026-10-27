import { memo } from 'react';
import type { DraftChanceVm } from '@/view-models';
import styles from './draft.module.css';
import { PairLine } from './pair-line';

const draftResultComponent = function DraftResultComponent({
  view,
  hasPicks,
}: {
  readonly view: DraftChanceVm;
  readonly hasPicks: boolean;
}) {
  if (view.isMetaLoading) return <p className="status">Загружаем мету…</p>;
  if (view.chanceValue == null) {
    return (
      <p className="status">
        {hasPicks ? 'Мало пар с сотней игр, чтобы оценить драфт' : 'Выберите свою команду и команду соперника'}
      </p>
    );
  }

  return (
    <div className={styles.result}>
      <p className={`${styles.chance} ${view.chanceValue >= 0.5 ? 'win' : 'loss'}`}>{view.chance}</p>
      <p className="muted">шанс победы</p>

      <p>{view.counterLine}</p>
      <p>{view.allyLine}</p>
      <p>{view.enemyLine}</p>

      {view.worst ? <PairLine title="Худший контрпик" pair={view.worst} /> : null}
      {view.best ? <PairLine title="Лучшая синергия" pair={view.best} /> : null}
    </div>
  );
};
draftResultComponent.displayName = 'DraftResult';
/** Win chance for the current draft. */
export const DraftResult = memo(draftResultComponent);

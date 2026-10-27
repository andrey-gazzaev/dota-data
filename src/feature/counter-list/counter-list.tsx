import { memo } from 'react';
import { Panel, Split } from '@/ui';
import type { NamedCounterVm } from '@/view-models';
import { CounterRow } from './counter-row';
import styles from './counter-list.module.css';

const counterListComponent = function CounterListComponent({
  counters,
  meta,
  metaError,
  metaLoading,
  isStatsLoading,
}: {
  readonly counters: readonly NamedCounterVm[];
  readonly meta: readonly NamedCounterVm[];
  readonly metaError: string | null;
  readonly metaLoading: boolean;
  readonly isStatsLoading: boolean;
}) {
  return (
    <Split>
      <Panel>
        <h2>Контрпики в ваших матчах</h2>
        <p className="muted">
          Винрейт в последних 40 матчах на герое против этого персонажа. Показаны соперники минимум с двумя играми.
        </p>

        {isStatsLoading ? <p className="status">Считаем матчи…</p> : null}
        {counters.length === 0 && !isStatsLoading ? (
          <p className="status">Мало матчей, чтобы выделить контрпики</p>
        ) : null}

        <div className={styles.list}>
          {counters.map((counter) => (
            <CounterRow key={counter.heroId} counter={counter} />
          ))}
        </div>
      </Panel>

      <Panel>
        <h2>Контрпики в мете</h2>
        <p className="muted">OpenDota, худший винрейт героя при выборке от 100 игр.</p>

        {metaLoading ? <p className="status">Загружаем мету…</p> : null}
        {metaError ? <p className="status">{metaError}</p> : null}

        <div className={styles.list}>
          {meta.map((counter) => (
            <CounterRow key={counter.heroId} counter={counter} />
          ))}
        </div>
      </Panel>
    </Split>
  );
};
counterListComponent.displayName = 'CounterList';
/** Heroes this player beats or loses to. */
export const CounterList = memo(counterListComponent);

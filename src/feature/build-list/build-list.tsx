import { memo } from 'react';
import { Panel, Split } from '@/ui';
import type { NamedBuildVm, NamedFrequencyVm } from '@/view-models';
import { BuildRow } from './build-row';
import styles from './build-list.module.css';
import { FrequencyChip } from './frequency-chip';

const buildListComponent = function BuildListComponent({
  builds,
  frequency,
  isStatsLoading,
}: {
  readonly builds: readonly NamedBuildVm[];
  readonly frequency: readonly NamedFrequencyVm[];
  readonly isStatsLoading: boolean;
}) {
  return (
    <Split>
      <Panel>
        <h2>Сборки</h2>
        <p className="muted">По последним 40 матчам на герое, у которых уже есть разбор.</p>

        {isStatsLoading ? <p className="status">Считаем матчи…</p> : null}
        {builds.length === 0 && !isStatsLoading ? (
          <p className="status">В последних 40 матчах нет разобранных предметов</p>
        ) : null}

        <div className={styles.builds}>
          {builds.map((build) => (
            <BuildRow key={build.key} build={build} />
          ))}
        </div>
      </Panel>

      <Panel>
        <h2>Частота предметов</h2>

        {frequency.length === 0 && !isStatsLoading ? <p className="status">Нет предметов</p> : null}

        <div className={styles.freq}>
          {frequency.map((item) => (
            <FrequencyChip key={item.id} item={item} />
          ))}
        </div>
      </Panel>
    </Split>
  );
};
buildListComponent.displayName = 'BuildList';
/** Common item sets and how often each item is bought. */
export const BuildList = memo(buildListComponent);

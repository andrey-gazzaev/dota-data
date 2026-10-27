import { memo } from 'react';
import { Split } from '@/ui';
import type { RecentMatchRowVm } from '@/view-models';
import { ItemIcons } from './item-icons';
import { Lineup } from './lineup';
import styles from './recent-matches.module.css';

const matchBodyComponent = function MatchBodyComponent({ row }: { readonly row: RecentMatchRowVm }) {
  return (
    <div className={styles.body}>
      <p>
        {row.result} · {row.score} · {row.length}
        {row.parsed ? (
          <>
            {' '}
            · Шанс драфта <span className={row.draftTone}>{row.draftLabel}</span>
          </>
        ) : null}
      </p>

      {row.goldPerMin != null || row.xpPerMin != null ? (
        <p className="muted">
          GPM {row.goldPerMin ?? '—'} · XPM {row.xpPerMin ?? '—'}
        </p>
      ) : null}

      {row.purchases.length > 0 ? (
        <div>
          <p className="muted">Порядок сборки</p>
          <ItemIcons items={row.purchases} order />
        </div>
      ) : null}

      {row.allies.length > 0 || row.enemies.length > 0 ? (
        <Split>
          <Lineup title="Союзники" players={row.allies} />
          <Lineup title="Противники" players={row.enemies} />
        </Split>
      ) : null}

      {row.parsed ? null : <p className="muted">Разбора нет, показаны только итоги.</p>}
    </div>
  );
};
matchBodyComponent.displayName = 'MatchBody';
/** Lineup, items, and purchase order for one match. */
export const MatchBody = memo(matchBodyComponent);

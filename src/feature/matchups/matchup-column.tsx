import { memo } from 'react';
import { Media } from '@/ui';
import type { MatchupRowVm } from '@/view-models';
import styles from './matchups.module.css';

const matchupColumnComponent = function MatchupColumnComponent({
  title,
  note,
  rows,
  empty,
  ready,
}: {
  readonly title: string;
  readonly note: string;
  readonly rows: readonly MatchupRowVm[];
  readonly empty: string;
  readonly ready: boolean;
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p className="muted">{note}</p>

      {ready && rows.length === 0 ? <p className="status">{empty}</p> : null}

      <div className={styles.list}>
        {rows.map((row) => (
          <article className={styles.row} key={row.heroId}>
            <Media>
              {row.image ? <img src={row.image} alt="" width={36} height={24} /> : null}
              {row.name}
            </Media>
            <span>
              <b className={row.value == null ? '' : row.value >= 0.5 ? 'win' : 'loss'}>{row.rate}</b>
              <div className="muted">{row.gamesLabel}</div>
            </span>
          </article>
        ))}
      </div>
    </div>
  );
};
matchupColumnComponent.displayName = 'MatchupColumn';
/** Best or worst heroes against the selected hero. */
export const MatchupColumn = memo(matchupColumnComponent);

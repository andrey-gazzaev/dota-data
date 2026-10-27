import { memo } from 'react';
import type { RecentMatchRowVm } from '@/view-models';
import styles from './recent-matches.module.css';

const lineupComponent = function LineupComponent({
  title,
  players,
}: {
  readonly title: string;
  readonly players: RecentMatchRowVm['allies'];
}) {
  return (
    <div className={styles.lineup}>
      <p className="muted">{title}</p>
      {players.map((player, index) => (
        <span key={`${player.id}-${index}`} className={styles.lineupRow}>
          {player.image ? <img src={player.image} alt="" width={24} height={18} /> : <span />}
          <span>{player.name}</span>
          <span className="muted">{player.score}</span>
        </span>
      ))}
    </div>
  );
};
lineupComponent.displayName = 'Lineup';
/** Allies and enemies in one match. */
export const Lineup = memo(lineupComponent);

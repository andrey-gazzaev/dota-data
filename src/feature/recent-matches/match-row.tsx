import { memo } from 'react';
import { Media } from '@/ui';
import type { RecentMatchRowVm } from '@/view-models';
import { ItemIcons } from './item-icons';
import { MatchBody } from './match-body';
import styles from './recent-matches.module.css';

const matchRowComponent = function MatchRowComponent({
  row,
  open,
  onToggle,
}: {
  readonly row: RecentMatchRowVm;
  readonly open: boolean;
  readonly onToggle: () => void;
}) {
  return (
    <li className={open ? styles.open : undefined}>
      <button type="button" className={styles.toggle} aria-expanded={open} onClick={onToggle}>
        <span>{row.date}</span>
        <Media>
          {row.heroImage ? <img src={row.heroImage} alt="" width={36} height={24} /> : null}
          {row.hero}
        </Media>
        <span className={row.win ? 'win' : 'loss'}>{row.result}</span>
        <span>{row.score}</span>
        <span className={row.draftTone} title="Шанс победы драфта">
          {row.draftLabel}
        </span>
        <ItemIcons items={row.items} neutral={row.neutral} />
      </button>
      {open ? <MatchBody row={row} /> : null}
    </li>
  );
};
matchRowComponent.displayName = 'MatchRow';
/** One recent match, collapsed until it is opened. */
export const MatchRow = memo(matchRowComponent);

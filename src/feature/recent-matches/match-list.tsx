import { memo, useState } from 'react';
import { Button } from '@/ui';
import type { RecentMatchRowVm } from '@/view-models';
import { MatchRow } from './match-row';
import styles from './match-list.module.css';

const matchListComponent = function MatchListComponent({
  showList,
  isLoading,
  matches,
  parse,
}: {
  readonly showList: boolean;
  readonly isLoading: boolean;
  readonly matches: readonly RecentMatchRowVm[];
  readonly parse: {
    readonly parsedCount: number;
    readonly missingCount: number;
    readonly running: boolean;
    readonly status: string | null;
    readonly error: string | null;
    readonly parseMatches: () => Promise<void>;
    readonly cancel: () => void;
  };
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <>
      {isLoading ? <p className="status">Загрузка…</p> : null}
      {showList && !isLoading && matches.length === 0 ? <p className="status">В сводках нет таких матчей</p> : null}

      {showList && matches.length > 0 ? (
        <>
          <p className="muted">
            Разобрано {parse.parsedCount} из {matches.length}. Обновление сводок эти матчи не скачивает.
          </p>
          <Button
            className={styles.action}
            variant={parse.running ? 'ghost' : 'primary'}
            disabled={!parse.running && parse.missingCount === 0}
            onClick={() => void (parse.running ? parse.cancel() : parse.parseMatches())}
          >
            {parse.running
              ? 'Отменить разбор'
              : parse.missingCount === 0
                ? 'Разбор есть'
                : `Разобрать ${parse.missingCount}`}
          </Button>
          {parse.status ? <p className="search-note">{parse.status}</p> : null}
          {parse.error ? <p className="search-note">{parse.error}</p> : null}
          <ul className={styles.list}>
            {matches.map((row) => (
              <MatchRow
                key={row.matchId}
                row={row}
                open={openId === row.matchId}
                onToggle={() => setOpenId((current) => (current === row.matchId ? null : row.matchId))}
              />
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
};
matchListComponent.displayName = 'MatchList';
/** Recent matches and the action that parses the ones without a lineup. */
export const MatchList = memo(matchListComponent);

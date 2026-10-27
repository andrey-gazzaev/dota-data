import { memo } from 'react';
import { Button } from '@/ui';
import { RequestLog } from './request-log';
import styles from './refresh-player.module.css';
import { useRefreshRun } from './use-refresh-run';

const refreshPlayerComponent = function RefreshPlayerComponent({ accountId }: { readonly accountId: number }) {
  const run = useRefreshRun(accountId);
  const showLog = run.running || run.logs.length > 0;

  return (
    <div className={styles.root}>
      <Button
        variant={run.running ? 'ghost' : 'primary'}
        onClick={() => void (run.running ? run.cancel() : run.start())}
      >
        {run.running ? (run.details ? 'Отменить детали' : 'Отменить') : 'Обновить'}
      </Button>

      {run.status ? <p className="search-note">{run.status}</p> : null}
      {run.error ? <p className="search-note">{run.error}</p> : null}

      {showLog ? (
        <RequestLog
          logs={run.logs}
          running={run.running}
          estimate={run.estimate}
          elapsed={run.elapsed}
          open={run.logOpen}
          onToggle={() => run.setLogOpen((open) => !open)}
        />
      ) : null}
    </div>
  );
};
refreshPlayerComponent.displayName = 'RefreshPlayer';
/** Button that refreshes this player's saved data. */
export const RefreshPlayer = memo(refreshPlayerComponent);

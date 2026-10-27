import { memo, useEffect, useRef } from 'react';
import type { EstimateDto, RequestLogDto } from '@/dtos';
import styles from './request-log.module.css';

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes <= 0) return `около ${seconds} с`;

  return `около ${minutes} мин ${seconds} с`;
}

function etaLabel(estimate: EstimateDto, elapsedMs: number): string {
  const time = formatRemaining(Math.max(0, estimate.remainingMs - elapsedMs));
  if (!estimate.detailsKnown) return `Пока ${time}`;

  return `Осталось ${time} · ${estimate.done} из ${estimate.planned}`;
}

function statusText(row: RequestLogDto): string {
  if (row.note) return row.note;
  if (row.status == null) return '…';

  return String(row.status);
}

function rowClass(row: RequestLogDto): string {
  if (row.status === 429) return styles.wait;
  if (row.note || (row.status != null && row.status >= 400)) return styles.bad;
  if (row.status != null && row.status < 300) return styles.ok;

  return styles.pending;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms} мс`;

  return `${(ms / 1000).toFixed(1)} с`;
}

const requestLogComponent = function RequestLogComponent({
  logs,
  running,
  estimate,
  elapsed,
  open,
  onToggle,
}: {
  readonly logs: readonly RequestLogDto[];
  readonly running: boolean;
  readonly estimate: { readonly snapshot: EstimateDto; readonly at: number } | null;
  readonly elapsed: number;
  readonly open: boolean;
  readonly onToggle: () => void;
}) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = logRef.current;
    if (!node) return;

    const nearBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
    if (nearBottom) node.scrollTop = node.scrollHeight;
  }, [logs]);

  return (
    <section className={open ? styles.log : `${styles.log} ${styles.collapsed}`} aria-label="Журнал запросов">
      <header>
        <strong>Журнал запросов</strong>
        <div className={styles.tools}>
          {running && estimate ? <span>{etaLabel(estimate.snapshot, elapsed)}</span> : null}
          <button type="button" className={styles.toggle} onClick={onToggle}>
            {open ? 'Свернуть' : 'Развернуть'}
          </button>
        </div>
      </header>

      {open ? (
        <div className={styles.body} ref={logRef}>
          {logs.length === 0 ? <p className={styles.empty}>Ждём первый запрос</p> : null}
          {logs.map((row) => (
            <p key={row.id} className={`${styles.row} ${rowClass(row)}`}>
              <span>{row.method}</span>
              <span>{row.target}</span>
              <span>{statusText(row)}</span>
              <span>{row.ms == null ? '' : formatDuration(row.ms)}</span>
            </p>
          ))}
        </div>
      ) : null}
    </section>
  );
};
requestLogComponent.displayName = 'RequestLog';
/** Requests made while a refresh is running. */
export const RequestLog = memo(requestLogComponent);

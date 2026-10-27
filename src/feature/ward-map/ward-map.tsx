import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '@/ui';
import styles from './ward-map.module.css';
import { useWardMap } from './use-ward-map';
import { WardControls } from './ward-controls';
import { WardStage } from './ward-stage';

const wardMapComponent = function WardMapComponent({
  accountId,
  matchId,
}: {
  readonly accountId: number;
  readonly matchId: number | null;
}) {
  const view = useWardMap(accountId, matchId);

  return (
    <Panel className={styles.links} aria-label="Карта вардов">
      <p className="muted">
        <Link to={`/player/${accountId}`}>К игроку</Link>
      </p>
      <h1 className={styles.title}>Карта вардов</h1>

      {view.loadingMatches ? <p className="status">Загрузка…</p> : null}
      {view.empty ? <p className="status">Нет матчей с журналом вардов</p> : null}

      {view.options.length > 0 ? (
        <WardControls
          accountId={accountId}
          matchId={matchId}
          options={view.options}
          parsed={view.parsed}
          loadingWards={view.loadingWards}
          parsing={view.parsing}
          parseStatus={view.parseStatus}
          min={view.min}
          max={view.max}
          time={view.time}
          clock={view.clock}
          mapReady={view.mapImage != null}
          onLoad={() => void view.loadMatch()}
          onCancel={view.cancelLoad}
          onTime={view.setTime}
        />
      ) : null}

      {view.error ? <p className="status">{view.error}</p> : null}
      {view.loadingWards ? <p className="status">Загрузка карты…</p> : null}
      {view.parsed && !view.hasMarks && !view.loadingWards ? (
        <p className="status">В этом матче нет журнала вардов</p>
      ) : null}

      {view.mapImage && view.hasMarks ? (
        <WardStage
          clock={view.clock}
          observers={view.observers}
          sentries={view.sentries}
          mapImage={view.mapImage}
          pins={view.pins}
        />
      ) : null}
    </Panel>
  );
};
wardMapComponent.displayName = 'WardMap';
/** Where wards stood in a match, at a chosen time. */
export const WardMap = memo(wardMapComponent);

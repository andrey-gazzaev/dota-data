import { memo } from 'react';
import type { WardPinVm } from '@/view-models';
import styles from './ward-stage.module.css';

const wardStageComponent = function WardStageComponent({
  clock,
  observers,
  sentries,
  mapImage,
  pins,
}: {
  readonly clock: string;
  readonly observers: number;
  readonly sentries: number;
  readonly mapImage: string;
  readonly pins: readonly WardPinVm[];
}) {
  return (
    <>
      <p className={styles.clock}>{clock}</p>
      <p className="muted">
        Обсерверы {observers} · Сентри {sentries}
      </p>

      <div className={styles.stage}>
        <img src={mapImage} alt="Карта Dota" />
        {pins.map((pin) => (
          <span
            key={pin.key}
            className={`${styles.pin} ${styles[pin.kind]} ${pin.radiant ? styles.radiant : styles.dire}`}
            style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
            title={pin.label}
          />
        ))}
      </div>

      <ul className={styles.legend}>
        <li>
          <i className={`${styles.pin} ${styles.observer} ${styles.radiant}`} /> Обсервер, Свет
        </li>
        <li>
          <i className={`${styles.pin} ${styles.observer} ${styles.dire}`} /> Обсервер, Тьма
        </li>
        <li>
          <i className={`${styles.pin} ${styles.sentry} ${styles.radiant}`} /> Сентри, Свет
        </li>
        <li>
          <i className={`${styles.pin} ${styles.sentry} ${styles.dire}`} /> Сентри, Тьма
        </li>
      </ul>
    </>
  );
};
wardStageComponent.displayName = 'WardStage';
/** Wards standing on the map at the chosen time. */
export const WardStage = memo(wardStageComponent);

import { memo } from 'react';
import type { DraftSlotVm } from '@/view-models';
import styles from './draft.module.css';

const draftTeamComponent = function DraftTeamComponent({
  title,
  active,
  slots,
  onActivate,
  onRemove,
}: {
  readonly title: string;
  readonly active: boolean;
  readonly slots: readonly DraftSlotVm[];
  readonly onActivate: () => void;
  readonly onRemove: (id: number) => void;
}) {
  return (
    <div className={active ? `${styles.side} ${styles.active}` : styles.side}>
      <button type="button" className={styles.sideTitle} aria-pressed={active} onClick={onActivate}>
        {title}
      </button>
      <p className="muted">{active ? 'Сюда попадёт следующий герой' : 'Нажмите, чтобы выбирать сюда'}</p>

      <div className={styles.slots}>
        {slots.map((slot, index) =>
          slot ? (
            <button
              key={slot.id}
              type="button"
              className={styles.slot}
              title={slot.name}
              aria-label={`Убрать ${slot.name}`}
              onClick={() => onRemove(slot.id)}
            >
              {slot.image ? <img src={slot.image} alt="" width={72} height={40} /> : <span>{slot.name}</span>}
            </button>
          ) : (
            <button
              key={`empty-${index}`}
              type="button"
              className={styles.slot}
              aria-label="Пустой слот"
              onClick={onActivate}
            />
          ),
        )}
      </div>
    </div>
  );
};
draftTeamComponent.displayName = 'DraftTeam';
/** Allied and enemy heroes already picked. */
export const DraftTeam = memo(draftTeamComponent);

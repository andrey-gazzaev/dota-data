import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, SelectField } from '@/ui';
import styles from './ward-controls.module.css';

const wardControlsComponent = function WardControlsComponent({
  accountId,
  matchId,
  options,
  parsed,
  loadingWards,
  parsing,
  parseStatus,
  min,
  max,
  time,
  clock,
  mapReady,
  onLoad,
  onCancel,
  onTime,
}: {
  readonly accountId: number;
  readonly matchId: number | null;
  readonly options: readonly { readonly matchId: number; readonly label: string }[];
  readonly parsed: boolean;
  readonly loadingWards: boolean;
  readonly parsing: boolean;
  readonly parseStatus: string | null;
  readonly min: number;
  readonly max: number;
  readonly time: number;
  readonly clock: string;
  readonly mapReady: boolean;
  readonly onLoad: () => void;
  readonly onCancel: () => void;
  readonly onTime: (time: number) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className={styles.controls}>
      <label>
        Матч
        <SelectField
          value={matchId ?? ''}
          onChange={(event) => {
            const next = event.target.value;
            navigate(next ? `/player/${accountId}/wards/${next}` : `/player/${accountId}/wards`);
          }}
        >
          <option value="">Выберите матч</option>
          {options.map((option) => (
            <option key={option.matchId} value={option.matchId}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </label>

      {matchId != null && !parsed && !loadingWards ? (
        <Button
          className={styles.action}
          variant={parsing ? 'ghost' : 'primary'}
          onClick={() => void (parsing ? onCancel() : onLoad())}
        >
          {parsing ? 'Отменить' : 'Забрать данные матча'}
        </Button>
      ) : null}
      {parseStatus ? <p className="search-note">{parseStatus}</p> : null}

      {parsed ? (
        <label>
          Время
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={Math.min(max, Math.max(min, time))}
            aria-label="Время матча"
            aria-valuetext={clock}
            disabled={!mapReady || max <= min}
            onChange={(event) => onTime(Number(event.target.value))}
          />
        </label>
      ) : null}
    </div>
  );
};
wardControlsComponent.displayName = 'WardControls';
/** Match choice, parse action, and the time slider. */
export const WardControls = memo(wardControlsComponent);

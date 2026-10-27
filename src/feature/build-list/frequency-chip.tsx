import { memo } from 'react';
import type { NamedFrequencyVm } from '@/view-models';
import styles from './build-list.module.css';

const frequencyChipComponent = function FrequencyChipComponent({ item }: { readonly item: NamedFrequencyVm }) {
  return (
    <span className={styles.chip}>
      {item.image ? <img src={item.image} alt="" width={24} height={18} /> : null}
      {item.name}
      <small>
        {item.games} · {item.rate}
      </small>
    </span>
  );
};
frequencyChipComponent.displayName = 'FrequencyChip';
/** An item and its pick rate. */
export const FrequencyChip = memo(frequencyChipComponent);

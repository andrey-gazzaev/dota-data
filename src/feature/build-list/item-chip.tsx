import { memo } from 'react';
import type { NamedItemVm } from '@/view-models';
import styles from './build-list.module.css';

const itemChipComponent = function ItemChipComponent({ item }: { readonly item: NamedItemVm }) {
  return (
    <span className={styles.chip}>
      {item.image ? <img src={item.image} alt="" width={24} height={18} /> : null}
      {item.name}
    </span>
  );
};
itemChipComponent.displayName = 'ItemChip';
/** An item image and name. */
export const ItemChip = memo(itemChipComponent);

import { memo } from 'react';
import type { RecentMatchRowVm } from '@/view-models';
import styles from './recent-matches.module.css';

const itemIconsComponent = function ItemIconsComponent({
  items,
  neutral = null,
  order = false,
}: {
  readonly items: RecentMatchRowVm['items'];
  readonly neutral?: RecentMatchRowVm['neutral'];
  readonly order?: boolean;
}) {
  if (items.length === 0 && !neutral) return null;
  return (
    <span className={order ? styles.order : styles.items}>
      {items.map((item, index) =>
        item.image ? (
          <img key={`${item.id}-${index}`} src={item.image} alt="" title={item.name} width={28} height={20} />
        ) : null,
      )}
      {neutral?.image ? (
        <img className={styles.neutral} src={neutral.image} alt="" title={neutral.name} width={28} height={20} />
      ) : null}
    </span>
  );
};
itemIconsComponent.displayName = 'ItemIcons';
/** Item images for one match, without names. */
export const ItemIcons = memo(itemIconsComponent);

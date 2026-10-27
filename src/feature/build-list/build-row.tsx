import { memo } from 'react';
import type { NamedBuildVm } from '@/view-models';
import { ItemChip } from './item-chip';
import styles from './build-list.module.css';

const buildRowComponent = function BuildRowComponent({ build }: { readonly build: NamedBuildVm }) {
  return (
    <article className={styles.build}>
      <div className={styles.items}>
        {build.items.map((item) => (
          <ItemChip key={item.id} item={item} />
        ))}
        {build.neutral ? <ItemChip item={build.neutral} /> : null}
      </div>
      <div>
        <b>{build.rate}</b>
        <div className="muted">{build.games} игр</div>
      </div>
    </article>
  );
};
buildRowComponent.displayName = 'BuildRow';
/** One item set. */
export const BuildRow = memo(buildRowComponent);

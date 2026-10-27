import { memo, type ReactNode } from 'react';
import styles from './topbar.module.css';

const topbarComponent = function TopbarComponent({
  brand,
  children,
}: {
  readonly brand: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.brand}>{brand}</div>
      <div className={styles.actions}>{children}</div>
    </header>
  );
};
topbarComponent.displayName = 'Topbar';
/** Sticky bar with the brand and page actions. */
export const Topbar = memo(topbarComponent);

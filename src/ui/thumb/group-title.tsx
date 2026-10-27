import { memo, type ReactNode } from 'react';
import styles from './thumb.module.css';

const groupTitleComponent = function GroupTitleComponent({ children }: { readonly children: ReactNode }) {
  return <h2 className={styles.group}>{children}</h2>;
};
groupTitleComponent.displayName = 'GroupTitle';
/** Heading for a group of thumbnails. */
export const GroupTitle = memo(groupTitleComponent);

import clsx from 'clsx';
import styles from './thumb.module.css';

/** Classes for a thumbnail, including the selected state. */
export function thumbClass(selected?: boolean, className?: string) {
  return clsx(styles.thumb, selected && styles.selected, className);
}

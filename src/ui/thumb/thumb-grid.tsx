import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './thumb.module.css';

const thumbGridComponent = function ThumbGridComponent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(styles.grid, className)} {...props} />;
};
thumbGridComponent.displayName = 'ThumbGrid';
/** A grid of thumbnails. */
export const ThumbGrid = memo(thumbGridComponent);

import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './split.module.css';

const splitComponent = function SplitComponent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(styles.split, className)} {...props} />;
};
splitComponent.displayName = 'Split';
/** Two regions side by side. */
export const Split = memo(splitComponent);

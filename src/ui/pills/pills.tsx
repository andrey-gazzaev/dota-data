import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './pills.module.css';

const pillsComponent = function PillsComponent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(styles.pills, className)} {...props} />;
};
pillsComponent.displayName = 'Pills';
/** A row of exclusive choices. */
export const Pills = memo(pillsComponent);

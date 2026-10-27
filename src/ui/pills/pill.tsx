import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './pills.module.css';

const pillComponent = function PillComponent({ className, type = 'button', ...props }: ComponentProps<'button'>) {
  return <button type={type} className={clsx(styles.pill, className)} {...props} />;
};
pillComponent.displayName = 'Pill';
/** One choice in a row of options. */
export const Pill = memo(pillComponent);

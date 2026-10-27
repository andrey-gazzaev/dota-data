import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './shell.module.css';

const shellComponent = function ShellComponent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(styles.shell, className)} {...props} />;
};
shellComponent.displayName = 'Shell';
/** Page chrome around the top bar and the page. */
export const Shell = memo(shellComponent);

import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './page.module.css';

const pageComponent = function PageComponent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={clsx(styles.page, className)} {...props} />;
};
pageComponent.displayName = 'Page';
/** Centered column for one page. */
export const Page = memo(pageComponent);

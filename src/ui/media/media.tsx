import clsx from 'clsx';
import { memo, type ReactNode } from 'react';
import styles from './media.module.css';

const mediaComponent = function MediaComponent({
  size = 'cell',
  className,
  children,
}: {
  readonly size?: 'cell' | 'lead';
  readonly className?: string;
  readonly children: ReactNode;
}) {
  const name = clsx(size === 'lead' ? styles.lead : styles.cell, className);
  if (size === 'lead') return <div className={name}>{children}</div>;
  return <span className={name}>{children}</span>;
};
mediaComponent.displayName = 'Media';
/** Image and text side by side. */
export const Media = memo(mediaComponent);

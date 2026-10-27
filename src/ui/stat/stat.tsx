import { memo, type ReactNode } from 'react';
import styles from './stat.module.css';

const statComponent = function StatComponent({
  label,
  value,
  detail,
  children,
}: {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly detail?: ReactNode;
  readonly children?: ReactNode;
}) {
  return (
    <article className={styles.stat}>
      <strong>{label}</strong>
      <b>{value}</b>
      {detail != null ? <span className={styles.detail}>{detail}</span> : null}
      {children}
    </article>
  );
};
statComponent.displayName = 'Stat';
/** A labeled number with an optional note. */
export const Stat = memo(statComponent);

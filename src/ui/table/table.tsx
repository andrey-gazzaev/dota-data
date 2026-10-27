import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './table.module.css';

const tableComponent = function TableComponent({ className, ...props }: ComponentProps<'table'>) {
  return <table className={clsx(styles.table, className)} {...props} />;
};
tableComponent.displayName = 'Table';
/** Rows and columns of data. */
export const Table = memo(tableComponent);

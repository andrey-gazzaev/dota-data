import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './field.module.css';

const selectFieldComponent = function SelectFieldComponent({ className, ...props }: ComponentProps<'select'>) {
  return <select className={clsx(styles.control, className)} {...props} />;
};
selectFieldComponent.displayName = 'SelectField';
/** Dropdown for one choice. */
export const SelectField = memo(selectFieldComponent);

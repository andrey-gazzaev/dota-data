import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './button.module.css';

const buttonComponent = function ButtonComponent({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { readonly variant?: 'primary' | 'ghost' }) {
  return (
    <button type={type} className={clsx(variant === 'ghost' ? styles.ghost : styles.primary, className)} {...props} />
  );
};
buttonComponent.displayName = 'Button';
/** Action control. Primary is filled; ghost is quiet. */
export const Button = memo(buttonComponent);

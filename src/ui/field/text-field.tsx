import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './field.module.css';

const textFieldComponent = function TextFieldComponent({
  tone = 'inset',
  width = 'fill',
  className,
  ...props
}: ComponentProps<'input'> & { readonly tone?: 'surface' | 'inset'; readonly width?: 'fill' | 'compact' }) {
  return (
    <input
      className={clsx(
        styles.control,
        tone === 'surface' && styles.surface,
        width === 'compact' && styles.compact,
        className,
      )}
      {...props}
    />
  );
};
textFieldComponent.displayName = 'TextField';
/** Single-line text input. */
export const TextField = memo(textFieldComponent);

import { memo, type ComponentProps } from 'react';
import { thumbClass } from './thumb-class';

const thumbComponent = function ThumbComponent({
  selected,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { readonly selected?: boolean }) {
  return <button type={type} className={thumbClass(selected, className)} {...props} />;
};
thumbComponent.displayName = 'Thumb';
/** A thumbnail button. */
export const Thumb = memo(thumbComponent);

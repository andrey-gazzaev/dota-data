import { memo } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { thumbClass } from './thumb-class';

const thumbLinkComponent = function ThumbLinkComponent({
  selected,
  className,
  ...props
}: LinkProps & { readonly selected?: boolean }) {
  return <Link className={thumbClass(selected, className)} {...props} />;
};
thumbLinkComponent.displayName = 'ThumbLink';
/** A thumbnail that navigates. */
export const ThumbLink = memo(thumbLinkComponent);

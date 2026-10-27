import clsx from 'clsx';
import { memo, type ComponentProps } from 'react';
import styles from './panel.module.css';

const panelComponent = function PanelComponent({ className, ...props }: ComponentProps<'section'>) {
  return <section className={clsx(styles.panel, className)} {...props} />;
};
panelComponent.displayName = 'Panel';
/** Bordered section of a page. */
export const Panel = memo(panelComponent);

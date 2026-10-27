import { memo } from 'react';
import { Media } from '@/ui';
import type { NamedCounterVm } from '@/view-models';
import styles from './counter-list.module.css';

const counterRowComponent = function CounterRowComponent({ counter }: { readonly counter: NamedCounterVm }) {
  const tone = counter.value == null ? '' : counter.value >= 0.5 ? 'win' : 'loss';
  return (
    <article className={styles.row}>
      <Media>
        {counter.image ? <img src={counter.image} alt="" width={36} height={24} /> : null}
        {counter.name}
      </Media>
      <span>
        <b className={tone}>{counter.rate}</b>
        <div className="muted">{counter.games} игр</div>
      </span>
    </article>
  );
};
counterRowComponent.displayName = 'CounterRow';
/** One counter or ally and their win rate. */
export const CounterRow = memo(counterRowComponent);

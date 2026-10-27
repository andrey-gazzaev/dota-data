import { memo } from 'react';
import type { DraftPairViewVm } from '@/view-models';

const pairLineComponent = function PairLineComponent({
  title,
  pair,
}: {
  readonly title: string;
  readonly pair: DraftPairViewVm;
}) {
  return (
    <p>
      {title}: {pair.label} · {pair.rate} · {pair.gamesLabel}
    </p>
  );
};
pairLineComponent.displayName = 'PairLine';
/** One hero pair behind the draft win chance. */
export const PairLine = memo(pairLineComponent);

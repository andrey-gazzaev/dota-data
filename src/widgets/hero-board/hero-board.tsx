import { memo } from 'react';
import { PlayerDataProvider } from '@/context';
import { HeroBoardBody } from './hero-board-body';

const heroBoardComponent = function HeroBoardComponent({
  accountId,
  heroId,
}: {
  readonly accountId: number;
  readonly heroId: number;
}) {
  return (
    <PlayerDataProvider accountId={accountId}>
      <HeroBoardBody accountId={accountId} heroId={heroId} />
    </PlayerDataProvider>
  );
};
heroBoardComponent.displayName = 'HeroBoard';
/** Summary, builds, counters, and matches for one hero. */
export const HeroBoard = memo(heroBoardComponent);

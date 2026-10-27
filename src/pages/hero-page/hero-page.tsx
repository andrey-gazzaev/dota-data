import { memo } from 'react';
import { HeroBoard } from '@/widgets';
import { Page } from '@/ui';

const heroPageComponent = function HeroPageComponent({
  accountId,
  heroId,
}: {
  readonly accountId: number;
  readonly heroId: number;
}) {
  return (
    <Page>
      <HeroBoard accountId={accountId} heroId={heroId} />
    </Page>
  );
};
heroPageComponent.displayName = 'HeroPage';
/** One hero for one account. */
export const HeroPage = memo(heroPageComponent);

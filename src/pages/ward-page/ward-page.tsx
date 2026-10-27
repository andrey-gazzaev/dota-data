import { memo } from 'react';
import { WardMap } from '@/feature';
import { Page } from '@/ui';

const wardPageComponent = function WardPageComponent({
  accountId,
  matchId,
}: {
  readonly accountId: number;
  readonly matchId: number | null;
}) {
  return (
    <Page>
      <WardMap accountId={accountId} matchId={matchId} />
    </Page>
  );
};
wardPageComponent.displayName = 'WardPage';
/** Ward map for one account. */
export const WardPage = memo(wardPageComponent);

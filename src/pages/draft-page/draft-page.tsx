import { memo } from 'react';
import { Draft } from '@/feature';
import { usePlayerData } from '@/hooks';
import { Page } from '@/ui';

const draftPageComponent = function DraftPageComponent({ accountId }: { readonly accountId: number }) {
  const player = usePlayerData(accountId);

  return (
    <Page>
      <Draft
        accountId={accountId}
        isLoading={player.isLoading}
        error={player.error}
        heroes={player.view?.heroes}
        heroMap={player.view?.heroMap}
      />
    </Page>
  );
};
draftPageComponent.displayName = 'DraftPage';
/** Draft for one account. */
export const DraftPage = memo(draftPageComponent);

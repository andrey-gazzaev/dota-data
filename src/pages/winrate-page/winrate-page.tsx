import { memo } from 'react';
import { HeroTable } from '@/feature';
import { usePlayerData } from '@/hooks';
import { Page } from '@/ui';

const winratePageComponent = function WinratePageComponent({ accountId }: { readonly accountId: number }) {
  const player = usePlayerData(accountId);

  return (
    <Page>
      <HeroTable accountId={accountId} heroes={player.view ? player.view.heroes : null} />
    </Page>
  );
};
winratePageComponent.displayName = 'WinratePage';
/** Win rate by hero for one account. */
export const WinratePage = memo(winratePageComponent);

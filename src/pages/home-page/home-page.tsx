import { memo } from 'react';
import { HomeGate } from '@/feature';
import { Page } from '@/ui';

const homePageComponent = function HomePageComponent() {
  return (
    <Page>
      <HomeGate />
    </Page>
  );
};
homePageComponent.displayName = 'HomePage';
/** Saved players, or search when none are saved yet. */
export const HomePage = memo(homePageComponent);

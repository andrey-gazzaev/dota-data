import { memo } from 'react';
import { BuildList, CounterList, HeroSummary, RecentMatches } from '@/feature';
import { useHeroDetails } from '@/feature/hero-details/use-hero-details';

const heroBoardBodyComponent = function HeroBoardBodyComponent({
  accountId,
  heroId,
}: {
  readonly accountId: number;
  readonly heroId: number;
}) {
  const details = useHeroDetails(heroId);

  return (
    <>
      <HeroSummary
        accountId={accountId}
        heroId={heroId}
        isLoading={details.isLoading}
        error={details.error}
        heroName={details.heroName}
        heroImage={details.heroImage}
        games={details.games}
        wins={details.wins}
        rate={details.rate}
        hasLocalData={details.hasLocalData}
      />

      <RecentMatches heroId={heroId} />

      <BuildList builds={details.builds} frequency={details.frequency} isStatsLoading={details.isStatsLoading} />

      <CounterList
        counters={details.counters}
        meta={details.meta}
        metaError={details.metaError}
        metaLoading={details.metaLoading}
        isStatsLoading={details.isStatsLoading}
      />
    </>
  );
};
heroBoardBodyComponent.displayName = 'HeroBoardBody';
/** Summary, matches, builds, and counters for one hero. */
export const HeroBoardBody = memo(heroBoardBodyComponent);

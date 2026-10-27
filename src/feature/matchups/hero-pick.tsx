import { memo } from 'react';
import { ThumbLink } from '@/ui';
import type { MatchupHeroVm } from '@/view-models';

const heroPickComponent = function HeroPickComponent({
  accountId,
  hero,
  selected,
}: {
  readonly accountId: number;
  readonly hero: MatchupHeroVm;
  readonly selected: boolean;
}) {
  return (
    <ThumbLink
      role="listitem"
      to={`/player/${accountId}/matchups/${hero.id}`}
      selected={selected}
      title={`${hero.name} · ${hero.games}`}
      aria-label={`${hero.name}, ${hero.games}`}
      aria-current={selected ? 'page' : undefined}
    >
      {hero.image ? <img src={hero.image} alt="" width={72} height={40} /> : <span>{hero.name}</span>}
    </ThumbLink>
  );
};
heroPickComponent.displayName = 'HeroPick';
/** A hero that opens that hero’s matchups. */
export const HeroPick = memo(heroPickComponent);

import { memo } from 'react';
import { Thumb } from '@/ui';
import type { DraftHeroVm } from '@/view-models';

const heroPickComponent = function HeroPickComponent({
  hero,
  taken,
  onToggle,
}: {
  readonly hero: DraftHeroVm;
  readonly taken: boolean;
  readonly onToggle: (id: number) => void;
}) {
  return (
    <Thumb
      selected={taken}
      title={`${hero.name} · ${hero.games}`}
      aria-label={`${hero.name}, ${hero.games}`}
      aria-pressed={taken}
      onClick={() => onToggle(hero.id)}
    >
      {hero.image ? <img src={hero.image} alt="" width={72} height={40} /> : <span>{hero.name}</span>}
    </Thumb>
  );
};
heroPickComponent.displayName = 'HeroPick';
/** A hero that can be added to the draft. */
export const HeroPick = memo(heroPickComponent);

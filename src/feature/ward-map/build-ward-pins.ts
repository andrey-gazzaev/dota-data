import type { GameCatalog, WardMark } from '@/models';
import { formatGameClock, wardMapPoint, wardsStanding } from '@/services';
import type { WardPinVm } from '@/view-models';

function heroName(catalog: GameCatalog | undefined, heroId: number): string {
  if (heroId <= 0) return 'Герой';

  return catalog?.heroes.find((hero) => hero.id === heroId)?.localizedName ?? `Герой ${heroId}`;
}

/** Wards still standing at this time, placed on the map. */
export function buildWardPins(
  marks: readonly WardMark[],
  time: number,
  catalog: GameCatalog | undefined,
): readonly WardPinVm[] {
  return wardsStanding(marks, time).map((mark, index) => {
    const point = wardMapPoint(mark.x, mark.y);
    const kindLabel = mark.kind === 'observer' ? 'обсервер' : 'сентри';

    return {
      key: `${mark.kind}-${mark.heroId}-${mark.placedAt}-${mark.x}-${mark.y}-${index}`,
      left: point.left,
      top: point.top,
      kind: mark.kind,
      radiant: mark.radiant,
      label: `${heroName(catalog, mark.heroId)} · ${kindLabel} · ${formatGameClock(mark.placedAt)}`,
    };
  });
}

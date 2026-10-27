import type { WardMark } from '@/models';

const OBSERVER_SECONDS = 360;
const SENTRY_SECONDS = 240;

/** How long a ward stays up when the log has no removal. Seconds. */
export function wardLifetime(kind: WardMark['kind']): number {
  return kind === 'observer' ? OBSERVER_SECONDS : SENTRY_SECONDS;
}

/** Wards still standing at this match time. */
export function wardsStanding(marks: readonly WardMark[], timeSeconds: number): readonly WardMark[] {
  return marks.filter((mark) => mark.placedAt <= timeSeconds && timeSeconds < mark.leftAt);
}

/** Position of a map coordinate, as a percentage of the map. */
export function wardMapPoint(x: number, y: number): { readonly left: number; readonly top: number } {
  const uvX = x - 64;
  const uvY = 127 - (y - 64);
  return { left: (uvX / 127) * 100, top: (uvY / 127) * 100 };
}

/** Map image for the patch this match was played on. */
export function wardMapImage(startTime: number): string {
  if (startTime >= Date.parse('2025-12-16T00:50:40.281Z') / 1000) return '/map/detailed_740.jpg';
  if (startTime >= Date.parse('2025-02-19T13:48:29.412Z') / 1000) return '/map/detailed_738.jpg';
  return '/map/detailed_733.jpg';
}

/** Game clock as m:ss. A leading minus marks time before the horn. */
export function formatGameClock(seconds: number): string {
  const sign = seconds < 0 ? '-' : '';
  const abs = Math.abs(Math.trunc(seconds));
  const minutes = Math.floor(abs / 60);
  const rest = abs % 60;
  return `${sign}${minutes}:${rest.toString().padStart(2, '0')}`;
}

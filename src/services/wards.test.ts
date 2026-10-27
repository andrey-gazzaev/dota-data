import { describe, expect, it } from 'vitest';
import type { WardMark } from '@/models';
import { formatGameClock, wardLifetime, wardMapImage, wardMapPoint, wardsStanding } from './wards';

function mark(placedAt: number, leftAt: number, kind: WardMark['kind'] = 'observer'): WardMark {
  return { kind, x: 0, y: 0, placedAt, leftAt, radiant: true, heroId: 1 };
}

describe('wardsStanding', () => {
  it('keeps a ward from the placement second until the second it leaves', () => {
    const placed = mark(-38, 322);
    expect(wardsStanding([placed], -39)).toEqual([]);
    expect(wardsStanding([placed], -38)).toEqual([placed]);
    expect(wardsStanding([placed], 321)).toEqual([placed]);
    expect(wardsStanding([placed], 322)).toEqual([]);
  });
});

describe('ward map', () => {
  it('converts a game coordinate into map percents', () => {
    const point = wardMapPoint(111.4, 163.4);
    expect(point.left).toBeCloseTo((47.4 / 127) * 100);
    expect(point.top).toBeCloseTo((27.6 / 127) * 100);
  });

  it('picks map art from the patch the match was played on', () => {
    expect(wardMapImage(Date.parse('2026-09-26T00:00:00Z') / 1000)).toBe('/map/detailed_740.jpg');
    expect(wardMapImage(Date.parse('2025-12-16T00:50:40.281Z') / 1000)).toBe('/map/detailed_740.jpg');
    expect(wardMapImage(Date.parse('2025-06-01T00:00:00Z') / 1000)).toBe('/map/detailed_738.jpg');
    expect(wardMapImage(Date.parse('2024-01-01T00:00:00Z') / 1000)).toBe('/map/detailed_733.jpg');
  });
});

describe('ward clock', () => {
  it('formats seconds before and after the horn', () => {
    expect(formatGameClock(-38)).toBe('-0:38');
    expect(formatGameClock(0)).toBe('0:00');
    expect(formatGameClock(65)).toBe('1:05');
  });

  it('uses six minutes for an observer and four for a sentry', () => {
    expect(wardLifetime('observer')).toBe(360);
    expect(wardLifetime('sentry')).toBe(240);
  });
});

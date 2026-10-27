import { describe, expect, it } from 'vitest';
import { formatRank } from '@/services';
import { resolveSearch } from '@/services';

const player = {
  accountId: 1,
  personaName: 'Anshef',
  avatarUrl: null,
  lastMatchTime: null,
};

describe('resolveSearch', () => {
  it('is empty without candidates', () => {
    expect(resolveSearch([])).toEqual({ kind: 'empty' });
  });

  it('opens a single candidate immediately', () => {
    expect(resolveSearch([player])).toEqual({ kind: 'single', player });
  });

  it('asks to choose when several players match', () => {
    const other = { ...player, accountId: 2, personaName: 'Other' };
    expect(resolveSearch([player, other])).toEqual({ kind: 'many', players: [player, other] });
  });
});

describe('formatRank', () => {
  it('renders medal and star', () => {
    expect(formatRank(32)).toBe('Рыцарь 2');
    expect(formatRank(80)).toBe('Титан');
    expect(formatRank(null)).toBeNull();
  });
});

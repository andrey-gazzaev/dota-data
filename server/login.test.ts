import { describe, expect, it } from 'vitest';
import { normalizeLogin } from './login';

describe('normalizeLogin', () => {
  it('accepts an email and a short login', () => {
    expect(normalizeLogin('  Andrey.G@Mail.com ')).toBe('andrey.g@mail.com');
    expect(normalizeLogin('Player_1')).toBe('player_1');
  });

  it('rejects a blank name, a space, and a broken email', () => {
    expect(normalizeLogin('  ')).toBeNull();
    expect(normalizeLogin('a')).toBeNull();
    expect(normalizeLogin('two words')).toBeNull();
    expect(normalizeLogin('not-an-email@')).toBeNull();
  });
});

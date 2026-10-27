import type { SearchCandidate, SearchResolution } from '@/models';

/** No player, one player, or a list to choose from. */
export function resolveSearch(players: SearchCandidate[]): SearchResolution {
  if (players.length === 0) return { kind: 'empty' };
  if (players.length === 1) {
    const player = players[0];
    if (!player) return { kind: 'empty' };
    return { kind: 'single', player };
  }
  return { kind: 'many', players };
}

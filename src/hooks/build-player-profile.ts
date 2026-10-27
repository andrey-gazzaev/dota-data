import type { PlayerSnapshot } from '@/models';
import { formatRank } from '@/services';

/** Rank line from a saved snapshot. Empty when no rank was recorded. */
export function buildPlayerProfile(snapshot: PlayerSnapshot): { readonly rankLabel: string | null } {
  const openRank = formatRank(snapshot.rankTier);
  const stratzRank = formatRank(snapshot.seasonRank);
  const rankParts = [
    openRank,
    stratzRank && stratzRank !== openRank ? `STRATZ ${stratzRank}` : null,
    snapshot.computedMmr != null ? `MMR ${Math.round(snapshot.computedMmr)}` : null,
    snapshot.leaderboardRank != null ? `таблица ${snapshot.leaderboardRank}` : null,
  ].filter((part): part is string => Boolean(part));

  return { rankLabel: rankParts.length > 0 ? rankParts.join(' · ') : null };
}

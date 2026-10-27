import { useState } from 'react';
import type { MatchupRankVm } from '@/view-models';

/** Rank groups the draft and matchup pages can filter by. */
export const RANK_GROUPS = [
  { id: 'all', label: 'Все', caption: 'по всем рангам' },
  { id: 'HERALD_GUARDIAN', label: 'Рекрут–Страж', caption: 'Рекрут и Страж' },
  { id: 'CRUSADER_ARCHON', label: 'Рыцарь–Герой', caption: 'Рыцарь и Герой' },
  { id: 'LEGEND_ANCIENT', label: 'Легенда–Властелин', caption: 'Легенда и Властелин' },
  { id: 'DIVINE_IMMORTAL', label: 'Божество–Титан', caption: 'Божество и Титан' },
] as const;

/** The selected rank group and the labels for the filter. */
export function useRankGroup() {
  const [rank, setRank] = useState<MatchupRankVm>('all');
  const info = RANK_GROUPS.find((item) => item.id === rank) ?? RANK_GROUPS[0];
  return { ranks: RANK_GROUPS, rank, setRank, rankCaption: info.caption };
}

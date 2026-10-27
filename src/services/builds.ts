import type { ItemBuild, ItemFrequency, MatchPerformance } from '@/models';

function played(rows: readonly MatchPerformance[], heroId: number): MatchPerformance[] {
  return rows.filter((row) => row.heroId === heroId);
}

function signature(
  row: MatchPerformance,
): { readonly key: string; readonly items: number[]; readonly neutralItem: number | null } | null {
  const items = row.items.filter((item) => item > 0).sort((left, right) => left - right);
  const neutralItem = row.neutralItem != null && row.neutralItem > 0 ? row.neutralItem : null;
  if (items.length === 0 && neutralItem == null) return null;

  return { key: `${items.join(',')}|${neutralItem ?? ''}`, items, neutralItem };
}

/** Most common item sets on this hero. */
export function aggregateBuilds(rows: readonly MatchPerformance[], heroId: number, limit = 5): ItemBuild[] {
  const builds = new Map<string, ItemBuild>();
  for (const row of played(rows, heroId)) {
    const signed = signature(row);
    if (!signed) continue;

    const current = builds.get(signed.key);
    builds.set(signed.key, {
      items: current?.items ?? signed.items,
      neutralItem: current?.neutralItem ?? signed.neutralItem,
      games: (current?.games ?? 0) + 1,
      wins: (current?.wins ?? 0) + (row.win ? 1 : 0),
    });
  }

  return [...builds.values()].sort((left, right) => right.games - left.games || right.wins - left.wins).slice(0, limit);
}

/** How often each item appears on this hero. */
export function itemFrequency(rows: readonly MatchPerformance[], heroId: number): ItemFrequency[] {
  const counts = new Map<number, ItemFrequency>();
  for (const row of played(rows, heroId)) {
    const ids = new Set(row.items.filter((item) => item > 0));
    if (row.neutralItem != null && row.neutralItem > 0) ids.add(row.neutralItem);
    for (const itemId of ids) {
      const current = counts.get(itemId);
      counts.set(itemId, {
        itemId,
        games: (current?.games ?? 0) + 1,
        wins: (current?.wins ?? 0) + (row.win ? 1 : 0),
      });
    }
  }

  return [...counts.values()].sort((left, right) => right.games - left.games || left.itemId - right.itemId);
}

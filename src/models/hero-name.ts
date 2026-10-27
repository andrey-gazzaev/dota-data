/** Stable hero key used to match catalog names. */
export function normalizeHeroKey(name: string): string {
  return name
    .replace(/^npc_dota_hero_/, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

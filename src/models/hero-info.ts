/** Hero card from the constants catalog: name and image. */
export type HeroInfo = {
  /** Hero id in Dota. */
  readonly id: number;

  /** OpenDota display name, usually English. */
  readonly localizedName: string;

  /** Catalog key for the portrait. */
  readonly shortName: string;

  /** Primary attribute. `all` means a universal hero. */
  readonly attribute: 'str' | 'agi' | 'int' | 'all';

  /** Portrait URL. */
  readonly image: string;
};

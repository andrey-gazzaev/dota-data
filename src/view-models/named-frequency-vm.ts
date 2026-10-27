import type { NamedItemVm } from './named-item-vm';

/** An item and how often it is bought. */
export type NamedFrequencyVm = NamedItemVm & {
  /** Matches in which the item was bought. */
  readonly games: number;

  /** Win rate ready to show. */
  readonly rate: string;
};

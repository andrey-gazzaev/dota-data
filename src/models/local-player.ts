import type { DataSource } from './data-source';

/** An account that already has a saved snapshot. */
export type LocalPlayer = {
  /** Steam account id. */
  readonly accountId: number;

  /** Name shown for this account. A placeholder when the name was not saved. */
  readonly personaName: string;

  /** Sources that have data for this account. */
  readonly sources: readonly DataSource[];
};

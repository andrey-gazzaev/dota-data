/** A player in search results, found by nickname or account id. */
export type SearchCandidate = {
  /** Steam account id. */
  readonly accountId: number;

  /** Nickname at search time. */
  readonly personaName: string;

  /** Avatar URL. Empty when OpenDota did not send one. */
  readonly avatarUrl: string | null;

  /** Start of the latest match, unix seconds. Empty when searching by a bare id. */
  readonly lastMatchTime: number | null;
};

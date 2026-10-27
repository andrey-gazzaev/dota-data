import type { SearchCandidate } from './search-candidate';

/** Where to send the user after search: an empty state, straight to a profile, or a choice list. */
export type SearchResolution =
  | {
      /** No matches. */
      readonly kind: 'empty';
    }
  | {
      /** Exactly one match, so the profile opens immediately. */
      readonly kind: 'single';

      /** The matched player. */
      readonly player: SearchCandidate;
    }
  | {
      /** Several matches, so the user must choose. */
      readonly kind: 'many';

      /** Candidates the user can choose from. */
      readonly players: readonly SearchCandidate[];
    };

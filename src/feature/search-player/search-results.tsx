import { memo } from 'react';
import type { SearchCandidate } from '@/models';
import styles from './search-results.module.css';

const searchResultsComponent = function SearchResultsComponent({
  candidates,
  onSelect,
}: {
  readonly candidates: readonly SearchCandidate[];
  readonly onSelect: (player: SearchCandidate) => void;
}) {
  if (candidates.length === 0) return null;
  return (
    <ul className={styles.list}>
      {candidates.map((player) => (
        <li key={player.accountId}>
          <button type="button" onClick={() => onSelect(player)}>
            {player.avatarUrl ? <img src={player.avatarUrl} alt="" width={36} height={36} /> : null}
            <span>
              <strong>{player.personaName}</strong>
              <small>{player.accountId}</small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};
searchResultsComponent.displayName = 'SearchResults';
/** Players that match the current search. */
export const SearchResults = memo(searchResultsComponent);

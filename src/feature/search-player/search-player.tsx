import { memo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchCandidate } from '@/models';
import { useSearchPlayers } from '@/queries';
import { resolveSearch } from '@/services';
import { Button, TextField } from '@/ui';
import styles from './search-player.module.css';
import { SearchResults } from './search-results';

const searchPlayerComponent = function SearchPlayerComponent() {
  const navigate = useNavigate();
  const searchPlayers = useSearchPlayers();
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [candidates, setCandidates] = useState<readonly SearchCandidate[] | null>(null);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextQuery = query.trim();
    if (!nextQuery) return;

    setPending(true);
    setError(null);
    setEmpty(false);
    setCandidates(null);

    try {
      const players = await searchPlayers(nextQuery);
      const resolution = resolveSearch(players);
      if (resolution.kind === 'single') {
        navigate(`/player/${resolution.player.accountId}`);
        return;
      }
      if (resolution.kind === 'many') setCandidates(resolution.players);
      else setEmpty(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Поиск не удался');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.root}>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <label className={styles.label}>
          <span className="sr">Ник или account id</span>
          <TextField
            tone="surface"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ник или account id"
            autoComplete="off"
          />
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? 'Ищем…' : 'Найти'}
        </Button>
      </form>

      {candidates ? (
        <SearchResults
          candidates={candidates}
          onSelect={(player) => {
            setCandidates(null);
            navigate(`/player/${player.accountId}`);
          }}
        />
      ) : null}

      {empty ? <p className="search-note">Никого не нашли</p> : null}
      {error ? <p className="search-note">{error}</p> : null}
    </div>
  );
};
searchPlayerComponent.displayName = 'SearchPlayer';
/** Find a player by nickname or account id. */
export const SearchPlayer = memo(searchPlayerComponent);

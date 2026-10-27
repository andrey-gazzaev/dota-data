import { memo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLocalPlayers } from '@/queries';
import { Panel } from '@/ui';
import styles from './home-gate.module.css';

const homeGateComponent = function HomeGateComponent() {
  const players = useLocalPlayers();

  if (players.isLoading) return <p className="status">Загрузка…</p>;
  if (players.error) return <p className="status">Не удалось загрузить игроков</p>;

  const list = players.data ?? [];
  const only = list[0];

  if (list.length === 1 && only) return <Navigate to={`/player/${only.accountId}`} replace />;
  if (list.length === 0) {
    return (
      <Panel>
        <h1>Найдите игрока</h1>
        <p className="muted">Поиск по нику или account id. Данные появятся после обновления.</p>
      </Panel>
    );
  }

  return (
    <Panel>
      <h1>Ваши игроки</h1>

      <ul className={styles.list}>
        {list.map((player) => (
          <li key={player.accountId}>
            <Link to={`/player/${player.accountId}`}>
              {player.personaName} · {player.accountId}
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
};
homeGateComponent.displayName = 'HomeGate';
/** Saved players, or search when none are saved yet. */
export const HomeGate = memo(homeGateComponent);

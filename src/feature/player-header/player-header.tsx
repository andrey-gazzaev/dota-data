import { memo } from 'react';
import { Link } from 'react-router-dom';
import { usePlayerDataContext } from '@/context';
import { Media, Panel } from '@/ui';
import styles from './player-header.module.css';

const playerHeaderComponent = function PlayerHeaderComponent() {
  const player = usePlayerDataContext();
  const snapshot = player.view?.snapshot ?? null;
  const rankLabel = player.view?.rankLabel ?? null;

  if (player.isLoading) return <p className="status">Загрузка…</p>;
  if (player.error || !snapshot) return <p className="status">{player.error ?? 'Нет данных'}</p>;

  return (
    <Panel>
      <Media size="lead">
        {snapshot.avatarUrl ? <img src={snapshot.avatarUrl} alt="" width={72} height={72} /> : null}
        <div className={styles.links}>
          <h1>{snapshot.personaName}</h1>
          <p className="muted">{rankLabel ?? 'Ранг не записан'}</p>
          <p className="muted">
            account id {snapshot.accountId}
            {snapshot.profileUrl ? (
              <>
                {' · '}
                <a href={snapshot.profileUrl}>профиль</a>
              </>
            ) : null}
          </p>
          <p className="muted">
            <Link to={`/player/${snapshot.accountId}/dashboard`}>Дашборд</Link>
            {' · '}
            <Link to={`/player/${snapshot.accountId}/wards`}>Карта вардов</Link>
            {' · '}
            <Link to={`/player/${snapshot.accountId}/matchups`}>Контрпики</Link>
            {' · '}
            <Link to={`/player/${snapshot.accountId}/draft`}>Драфт</Link>
            {' · '}
            <Link to={`/player/${snapshot.accountId}/winrate`}>Винрейт</Link>
          </p>

          {snapshot.hasLocalData ? null : (
            <p className="muted">Локальных файлов нет. Нажмите «Обновить», чтобы скачать их.</p>
          )}
        </div>
      </Media>
    </Panel>
  );
};
playerHeaderComponent.displayName = 'PlayerHeader';
/** Name, rank, and links for one player. */
export const PlayerHeader = memo(playerHeaderComponent);

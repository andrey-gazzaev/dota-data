import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Media, Panel } from '@/ui';
import styles from './hero-summary.module.css';

const heroSummaryComponent = function HeroSummaryComponent({
  accountId,
  heroId,
  isLoading,
  error,
  heroName,
  heroImage,
  games,
  wins,
  rate,
  hasLocalData,
}: {
  readonly accountId: number;
  readonly heroId: number;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly heroName: string | null;
  readonly heroImage: string;
  readonly games: number;
  readonly wins: number;
  readonly rate: string;
  readonly hasLocalData: boolean;
}) {
  if (isLoading) return <p className="status">Загрузка…</p>;
  if (error || !heroName) return <p className="status">{error ?? 'Нет данных'}</p>;

  return (
    <Panel>
      <Media size="lead">
        {heroImage ? <img src={heroImage} alt="" width={88} height={50} /> : null}
        <div>
          <h1>{heroName}</h1>
          <p className="muted">
            <Link to={`/player/${accountId}`}>К игроку</Link>
            {' · '}
            <Link to={`/player/${accountId}/dashboard`}>Дашборд</Link>
            {' · '}
            <Link to={`/player/${accountId}/matchups/${heroId}`}>Контрпики и синергия</Link>
          </p>

          {hasLocalData ? (
            <div className={styles.stats}>
              <div>
                <b>{games}</b>
                <span className="muted">игр</span>
              </div>
              <div>
                <b>{wins}</b>
                <span className="muted">побед</span>
              </div>
              <div>
                <b>{rate}</b>
                <span className="muted">винрейт</span>
              </div>
            </div>
          ) : (
            <p className="muted">Сначала обновите данные игрока.</p>
          )}
        </div>
      </Media>
    </Panel>
  );
};
heroSummaryComponent.displayName = 'HeroSummary';
/** Games and win rate on one hero. */
export const HeroSummary = memo(heroSummaryComponent);

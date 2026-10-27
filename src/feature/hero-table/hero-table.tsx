import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { NamedHeroVm } from '@/view-models';
import { Media, Panel, Table } from '@/ui';

function heroTone(hero: { readonly rate: number | null }): string {
  if (hero.rate == null) return '';
  return hero.rate >= 0.5 ? 'win' : 'loss';
}

const heroTableComponent = function HeroTableComponent({
  accountId,
  heroes,
}: {
  readonly accountId: number;
  readonly heroes: readonly NamedHeroVm[] | null;
}) {
  return (
    <Panel>
      <p className="muted">
        <Link to={`/player/${accountId}`}>К игроку</Link>
      </p>
      <h1>Герои</h1>

      {!heroes ? <p className="status">Загрузка…</p> : null}
      {heroes && heroes.length === 0 ? <p className="status">Список героев пуст</p> : null}

      {heroes && heroes.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <th>Герой</th>
              <th>Игры</th>
              <th>Победы</th>
              <th>Винрейт</th>
            </tr>
          </thead>
          <tbody>
            {heroes.map((hero) => (
              <tr key={hero.heroId}>
                <td>
                  <Link to={`/player/${accountId}/heroes/${hero.heroId}`}>
                    <Media>
                      {hero.image ? <img src={hero.image} alt="" width={36} height={24} /> : null}
                      {hero.name}
                    </Media>
                  </Link>
                </td>
                <td>{hero.games}</td>
                <td>{hero.wins}</td>
                <td className={heroTone(hero)}>{hero.rateLabel}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null}
    </Panel>
  );
};
heroTableComponent.displayName = 'HeroTable';
/** Win rate on each hero the player has played. */
export const HeroTable = memo(heroTableComponent);

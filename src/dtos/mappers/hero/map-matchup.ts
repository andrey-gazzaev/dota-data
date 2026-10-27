import type { CounterStat } from '@/models';
import type { MatchupDto } from '../../schemas/hero/matchup.schema';

/** Games and wins against one hero. */
export function mapMatchup(dto: MatchupDto): CounterStat {
  return { heroId: dto.heroId, games: dto.games, wins: dto.wins };
}

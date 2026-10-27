import type { PlayerSnapshot } from '@/models';
import type { PlayerSnapshotDto } from '../../schemas/player/player-snapshot.schema';

/** Profile, records, and hero totals for one account. */
export function mapPlayerSnapshot(dto: PlayerSnapshotDto): PlayerSnapshot {
  return {
    accountId: dto.accountId,
    personaName: dto.personaName,
    avatarUrl: dto.avatarUrl,
    profileUrl: dto.profileUrl,
    rankTier: dto.rankTier,
    leaderboardRank: dto.leaderboardRank,
    computedMmr: dto.computedMmr,
    seasonRank: dto.seasonRank,
    records: dto.records.map((record) => ({ ...record })),
    heroes: dto.heroes.map((hero) => ({ ...hero })),
    gpmHistogram: dto.gpmHistogram.map((bin) => ({ ...bin })),
    outcomes: {
      kills: dto.outcomes.kills.map((bin) => ({ ...bin })),
      deaths: dto.outcomes.deaths.map((bin) => ({ ...bin })),
      assists: dto.outcomes.assists.map((bin) => ({ ...bin })),
      towerDamage: dto.outcomes.towerDamage.map((bin) => ({ ...bin })),
    },
    hasLocalData: dto.hasLocalData,
  };
}

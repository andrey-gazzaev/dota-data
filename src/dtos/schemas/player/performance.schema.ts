import { z } from 'zod';
import { dataSourceSchema } from './data-source.schema';
import { matchPlayerSchema } from './match-player.schema';

/** One match row for a player. */
export const performanceSchema = z.object({
  matchId: z.number(),
  source: dataSourceSchema,
  heroId: z.number().nullable(),
  heroShortName: z.string().nullable(),
  win: z.boolean(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  goldPerMin: z.number().nullable(),
  xpPerMin: z.number().nullable(),
  towerDamage: z.number().nullable(),
  heroDamage: z.number().nullable(),
  lastHits: z.number().nullable(),
  items: z.array(z.number()),
  neutralItem: z.number().nullable(),
  purchases: z.array(z.string()),
  enemyHeroIds: z.array(z.number()),
  allies: z.array(matchPlayerSchema),
  enemies: z.array(matchPlayerSchema),
  startTime: z.number(),
  duration: z.number().nullable(),
});

/** One match row from the API. */
export type PerformanceDto = z.infer<typeof performanceSchema>;

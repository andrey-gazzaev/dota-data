import { z } from 'zod';
import { localPlayerSchema } from './local-player.schema';

/** Accounts that have a saved snapshot. */
export const localPlayersSchema = z.object({
  players: z.array(localPlayerSchema),
});

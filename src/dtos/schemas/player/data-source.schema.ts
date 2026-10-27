import { z } from 'zod';

/** Where a row of player data came from. */
export const dataSourceSchema = z.enum(['opendota', 'steam', 'stratz']);

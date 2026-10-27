import { z } from 'zod';
import { sessionUserSchema } from './session-user.schema';

/** Current session. The user is empty when nobody is signed in. */
export const sessionSchema = z.object({
  user: sessionUserSchema.nullable(),
});

/** Session payload from the API. */
export type SessionDto = z.infer<typeof sessionSchema>;

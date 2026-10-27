import { z } from 'zod';

/** Person signed in with an email or a login. */
export const sessionUserSchema = z.object({
  login: z.string(),
});

/** A signed-in person from the API. */
export type SessionUserDto = z.infer<typeof sessionUserSchema>;

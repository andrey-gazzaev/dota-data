import type { SessionUser } from '@/models';
import { api } from '../../http';
import { mapSessionUser } from '../../mappers/session/map-session-user';
import { sessionSchema } from '../../schemas/session/session.schema';

/** Sign-in, the current person, and sign-out. */
export class SessionApi {
  /** Person for the current cookie. Empty when nobody is signed in. */
  public async current(): Promise<SessionUser | null> {
    const { data } = await api.get('/api/session');
    return mapSessionUser(sessionSchema.parse(data).user);
  }

  /** Opens a session, creating the account when the login is new. */
  public async enter(login: string): Promise<SessionUser> {
    const { data } = await api.post('/api/session', { login });
    const user = mapSessionUser(sessionSchema.parse(data).user);
    if (!user) throw new Error('Не удалось войти');
    return user;
  }

  /** Drops the current session. */
  public async leave(): Promise<void> {
    await api.delete('/api/session');
  }
}

/** Shared session client. */
export const sessionApi = new SessionApi();

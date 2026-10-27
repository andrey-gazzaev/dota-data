import type { SessionUser } from '@/models';
import type { SessionUserDto } from '../../schemas/session/session-user.schema';

/** A signed-in person. Empty when nobody is signed in. */
export function mapSessionUser(dto: SessionUserDto | null): SessionUser | null {
  if (!dto) return null;
  return { login: dto.login };
}

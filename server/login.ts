const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const NAME = /^[a-z0-9](?:[a-z0-9._-]{0,30}[a-z0-9])?$/;

/** Email or login ready to store. Empty when the text is not a usable name. */
export function normalizeLogin(value: string): string | null {
  const login = value.trim().toLowerCase();
  if (login.length < 2 || login.length > 80) return null;
  if (login.includes('@')) return EMAIL.test(login) ? login : null;
  return NAME.test(login) ? login : null;
}

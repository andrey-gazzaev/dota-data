import { useContext } from 'react';
import { SessionContext, type SessionValue } from './session-context';

/** Signed-in person. Throws when there is no provider. */
export function useSessionContext(): SessionValue {
  const value = useContext(SessionContext);

  if (value === undefined) throw new Error('useSessionContext must be used within a SessionProvider');

  return value;
}

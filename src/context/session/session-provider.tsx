import { memo, useMemo, type ReactNode } from 'react';
import { useSession } from '@/queries';
import { SessionContext, type SessionValue } from './session-context';

const sessionProviderComponent = function SessionProviderComponent({ children }: { readonly children: ReactNode }) {
  const session = useSession();

  const error = session.error instanceof Error ? session.error.message : null;

  const value = useMemo(
    (): SessionValue => ({
      user: session.data ?? null,
      isLoading: session.isLoading,
      error,
    }),
    [session.data, session.isLoading, error],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
sessionProviderComponent.displayName = 'SessionProvider';
/** Loads the signed-in person once for the app. */
export const SessionProvider = memo(sessionProviderComponent);

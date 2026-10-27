import { createContext } from 'react';
import type { SessionUser } from '@/models';

/** Signed-in person shared with the whole app. */
export type SessionValue = {
  /** Current person. Empty when nobody is signed in. */
  readonly user: SessionUser | null;

  /** True while the session is loading for the first time. */
  readonly isLoading: boolean;

  /** Load error. Empty when the session request finished. */
  readonly error: string | null;
};

/** Shared inside this module. Call `useSessionContext` instead. */
export const SessionContext = createContext<SessionValue | undefined>(undefined);

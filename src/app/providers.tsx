import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { memo, useState, type ReactNode } from 'react';
import { SessionProvider } from '@/context';

const providersComponent = function ProvidersComponent({ children }: { readonly children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>{children}</SessionProvider>
    </QueryClientProvider>
  );
};
providersComponent.displayName = 'Providers';
/** Query client and the signed-in person. */
export const Providers = memo(providersComponent);

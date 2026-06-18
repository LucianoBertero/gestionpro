import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30s by default. Mutations explicitly
        // invalidate, so CRUD stays instant. Navigations within that window
        // reuse the cache instead of hammering the backend.
        staleTime: 30 * 1000,
        // Pause polling/refetching when the tab is in the background.
        refetchOnWindowFocus: false,
        refetchIntervalInBackground: false,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: use React's cache() so the same instance is reused across
    // renders within the same request (required for proper dehydrate).
    return makeServerQueryClient();
  }
  // Browser: singleton so all client components share the same cache.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

const makeServerQueryClient = cache(makeQueryClient);

import { QueryClient, defaultShouldDehydrateQuery, isServer } from '@tanstack/react-query';
import { cache } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep data fresh for 0ms by default — mutations explicitly invalidate,
        // and we want navigations to always revalidate against the server.
        staleTime: 0,
        refetchOnWindowFocus: false,
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

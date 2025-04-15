import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from '@tanstack/react-query'
import {cache} from 'react'

// Query client needs to be created inside react to avoid issues with SSR
// @see https://tanstack.com/query/latest/docs/framework/react/guides/ssr#initial-setup
// Though not sure what this message is about
// @see https://trpc.io/docs/client/tanstack-react-query/server-components
// NOTE: Avoid useState when initializing the query client if you don't
//       have a suspense boundary between this and the code that may
//       suspend because React will throw away the client on the initial
//       render if it suspends and there is no boundary
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

// QueryClient based server access

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
// the downside of this is that dehydrate will be more expensive
// because it will dehydrate all data in cache every time
// @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#alternative-use-a-single-queryclient-for-prefetching

export const getServerQueryClient = cache(getQueryClient)

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    // TODO: Figure out if we can simply return getServerQueryClient and whether it has the same effect
    return createQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = createQueryClient()
    return browserQueryClient
  }
}

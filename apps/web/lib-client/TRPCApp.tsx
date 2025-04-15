/* eslint-disable import-x/no-named-as-default-member */
'use client'

import type {AppRouter} from '@openint/api-v1'

import {isServer, QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryStreamedHydration} from '@tanstack/react-query-next-experimental'
import {createTRPCClient, httpLink} from '@trpc/client'
import {createTRPCContext} from '@trpc/tanstack-react-query'
import React from 'react'
import {resolveRoute} from '@openint/env'
import {getQueryClient} from '@/lib-common/trpc.common'

const {TRPCProvider, useTRPC, useTRPCClient} = createTRPCContext<AppRouter>()

export {useTRPC, useTRPCClient}
// Convenience exports since useQuery and useTRPC are always together
export {useMutation, useQuery, useSuspenseQuery} from '@tanstack/react-query'

// TODO: Rename file to trpc.client.tsx
// TODO: Rename this to TRPCReactProvider

export function TRPCApp({
  token,
  cookie,
  reactQueryNextExperimental /* = true */,
  children,
}: {
  token?: string
  /** Cookie for SSR requests to API route where we need to pass the cookie for auth information */
  cookie?: string

  /**
   * Enable automatic prefetching of useSuspenseQuery via `ReactQueryStreamedHydration`
   * provider from `@tanstack/react-query-next-experimental`.
   * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#experimental-streaming-without-prefetching-in-nextjs
   *
   * downsides are 1) request waterfall and 2) additional http request to the API
   * instead of direct trpc router call on the server-side
   *
   * More importantly, it can result in `result.data` being empty object (vs. undefined)
   * for a split second on the client which will have to be handled in a hooks-safe way, defeating the
   * convenience offered by useSuspenseQuery and also leading to initial flash of empty data
   *
   * There is also frequently but not 100% reproducible issue with Hydration failed
   * because the server rendered HTML didn't match the client
   * I suppose that's because of the experimental nature of the library?
   * great to know that automatic prefetching is even possible! One day.
   * TODO: File issue with react-query regarding this...
   */
  reactQueryNextExperimental?: boolean
  children: React.ReactNode
}) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient()

  const trpcClient = React.useMemo(
    () =>
      createTRPCClient<AppRouter>({
        links: [
          httpLink({
            // TODO: if SRR, bypass http link completely, is that possibe?
            url: new URL(...resolveRoute('/api/v1/trpc', null)).toString(),
            // Rely on cookie auth when explicit token is not provided
            headers: {
              ...(token ? {authorization: `Bearer ${token}`} : {}),
              ...(isServer && cookie ? {cookie} : {}),
            },
          }),
        ],
      }),
    [token],
  )
  // For debugging purposes
  ;(globalThis as any).trpcClient = trpcClient
  ;(globalThis as any).queryClient = queryClient

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {reactQueryNextExperimental ? (
          <ReactQueryStreamedHydration
            options={{
              // Not sure why this isn't already the default...
              dehydrate: queryClient.getDefaultOptions().dehydrate,
              hydrate: {
                defaultOptions: queryClient.getDefaultOptions().hydrate,
              },
            }}>
            {children}
          </ReactQueryStreamedHydration>
        ) : (
          children
        )}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

// Example code... that results in empty data
// export function ConnectorConfigList() {
//   // Must use multiple queries to avoid waterfall and allow server prefetch to work
//   const [res, connectorRes] = useSuspenseQueries({
//     queries: [
//       trpc.listConnectorConfigs.queryOptions({
//         expand: ['connection_count', 'connector.schemas'],
//       }),
//       trpc.listConnectors.queryOptions({
//         expand: ['schemas'],
//       }),
//     ],
//   })
//   console.log('[connector-config-list] res', res.data)
//   console.log('[connector-config-list] connectorRes', connectorRes.data)
//   // We have data but also empty items...
//   if (!res.data.items || !connectorRes.data.items) {
//     return new Error('No data') // This should never happen... but it does with ReactQueryStreamedHydration
//   }
// }

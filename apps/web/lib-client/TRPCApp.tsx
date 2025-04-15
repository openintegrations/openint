/* eslint-disable import-x/no-named-as-default-member */
'use client'

import type {AppRouter} from '@openint/api-v1'

import {QueryClientProvider} from '@tanstack/react-query'
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
  reactQueryNextExperimental,
  children,
}: {
  token?: string
  /**
   * Enable automatic prefetching of useSuspenseQuery via `ReactQueryStreamedHydration`
   * provider from `@tanstack/react-query-next-experimental`.
   * @see https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr#experimental-streaming-without-prefetching-in-nextjs
   *
   * downsides are 1) request waterfall and 2) additional http request to the API
   * instead of direct trpc router call on the server-side
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
            headers: token ? {authorization: `Bearer ${token}`} : undefined,
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
              dehydrate: {
                shouldDehydrateQuery(query) {
                  console.log('[TRPCApp] shouldDehydrateQuery', query.queryKey)
                  return true
                },
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

/* eslint-disable import-x/no-named-as-default-member */
'use client'

import type {AppRouter} from '@openint/api-v1'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {createTRPCClient, httpLink} from '@trpc/client'
import {createTRPCContext} from '@trpc/tanstack-react-query'
import React from 'react'
import {resolveRoute} from '@openint/env'
import {Toaster} from '@openint/shadcn/ui'

const {TRPCProvider, useTRPC, useTRPCClient} = createTRPCContext<AppRouter>()

export {useTRPC, useTRPCClient}
// Convenience exports since useQuery and useTRPC are always together
export {useMutation, useQuery, useSuspenseQuery} from '@tanstack/react-query'

export function TRPCApp({
  token,
  children,
}: {
  token?: string
  children: React.ReactNode
}) {
  // Query client needs to be created inside react to avoid issues with SSR
  // @see https://tanstack.com/query/latest/docs/framework/react/guides/ssr#initial-setup
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  )

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
        {children}
        <Toaster />
      </TRPCProvider>
    </QueryClientProvider>
  )
}

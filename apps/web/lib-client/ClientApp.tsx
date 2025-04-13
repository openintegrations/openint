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
export {useQuery, useMutation, useSuspenseQuery} from '@tanstack/react-query'

export function ClientApp({
  token,
  children,
}: {
  token?: string
  children: React.ReactNode
}) {
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
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
        <Toaster />
      </TRPCProvider>
    </QueryClientProvider>
  )
}
// MARK: - Query client utils

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        refetchOnMount: false,
        // maybe this should be true actually?
        refetchOnWindowFocus: false,
      },
    },
  })
}
let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

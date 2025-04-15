/* eslint-disable import-x/no-named-as-default-member */
'use client'

import type {AppRouter} from '@openint/api-v1'

import {QueryClientProvider} from '@tanstack/react-query'
import {createTRPCClient, httpLink} from '@trpc/client'
import {createTRPCContext} from '@trpc/tanstack-react-query'
import React from 'react'
import {resolveRoute} from '@openint/env'
import {Toaster} from '@openint/shadcn/ui'
import {getQueryClient} from '@/lib-common/trpc.common'

const {TRPCProvider, useTRPC, useTRPCClient} = createTRPCContext<AppRouter>()

export {useTRPC, useTRPCClient}
// Convenience exports since useQuery and useTRPC are always together
export {useMutation, useQuery, useSuspenseQuery} from '@tanstack/react-query'

// TODO: Rename file to trpc.client.tsx
// TODO: Rename this to TRPCReactProvider

export function TRPCApp({
  token,
  children,
}: {
  token?: string
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
        {children}
        <Toaster />
      </TRPCProvider>
    </QueryClientProvider>
  )
}

'use client'

import React from 'react'
import type {AppRouter} from '@openint/api-v1'
import {
  createTRPCClient,
  createTRPCContext,
  httpLink,
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@openint/ui-v1'

export const {TRPCProvider, useTRPC, useTRPCClient} =
  createTRPCContext<AppRouter>()

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
        refetchOnMount: false,
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

export function ClientApp({
  token,
  children,
}: {
  token: string
  children: React.ReactNode
}) {
  const queryClient = getQueryClient()
  const [trpcClient] = React.useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpLink({
          // url: '/api/v1/trpc',
          // TODO: if server rendering, bypass http link completely
          url: 'http://localhost:4000/api/v1/trpc',
          headers: {authorization: `Bearer ${token}`},
        }),
      ],
    }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}

export function AddConnection(props: {initialData: Promise<any>}) {
  const initialData = React.use(props.initialData)

  // Simulate a random delay between 0-2 seconds
  // await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  // const [connectorConfigs] = trpc.listConnectorConfigs.useSuspenseQuery()

  const trpc = useTRPC() // use `import { trpc } from './utils/trpc'` if you're using the singleton pattern
  const res = useSuspenseQuery(
    trpc.listConnectorConfigs.queryOptions(
      {},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connectorConfigs = res.data.items

  return (
    <ul>
      {res.isFetching && <em>Loading...</em>}
      {connectorConfigs.map((ccfg) => (
        <li key={ccfg.id} className="ml-4 list-disc">
          <p>{ccfg.id}</p>
        </li>
      ))}
      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connectors'}
      </button>
    </ul>
  )
}

export function ConnectionList(props: {initialData?: Promise<any>}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))

  // Simulate a random delay between 0-2 seconds
  // await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000))

  // const [connections] = trpc.listConnections.useSuspenseQuery()

  const trpc = useTRPC() // use `import { trpc } from './utils/trpc'` if you're using the singleton pattern
  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {},
      (initialData ? {initialData} : undefined) as never,
    ),
  )

  const connections = res.data.items

  return (
    <ul>
      {res.isFetching && <em>Loading...</em>}
      {connections.map((conn) => (
        <li key={conn.id} className="ml-4 list-disc">
          <p>{conn.id}</p>
        </li>
      ))}
      <button
        onClick={() => res.refetch()}
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        disabled={res.isFetching}>
        {res.isFetching ? 'Refreshing...' : 'Refresh Connections'}
      </button>
    </ul>
  )
}

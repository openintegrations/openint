import type {QueryClient} from '@tanstack/react-query'
import {createTRPCReact, httpBatchLink, httpLink} from '@trpc/react-query'
import React from 'react'
import type {AnyRouter, FlatRouter} from '@openint/engine-backend'

export const _trpcReact = createTRPCReact<FlatRouter>()

export type TRPCReact<TRouter extends AnyRouter> = ReturnType<
  typeof createTRPCReact<TRouter>
>

// TODO: Make use of this from OpenIntProvider?
export function TRPCProvider({
  apiUrl,
  queryClient,
  children,
  accessToken,
  debug,
}: {
  apiUrl?: string
  queryClient: QueryClient
  accessToken?: string | null
  children: React.ReactNode
  debug?: boolean
}) {
  // TODO: Should we keep trpcClient the and useRef for the accessToken instead?
  const trpcClient = React.useMemo(
    () =>
      // Should we leverage ./trpcClient file or use _trpcReact to create client? Which one is better?
      // Disable reqeuest batching in DEBUG mode for easier debugging
      // createTRPCProxyClient<FlatRouter>({
      _trpcReact.createClient({
        links: [
          (debug || true ? httpLink : httpBatchLink)({
            url: apiUrl ?? '/api/v0/trpc',
            headers: () => ({
              ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
            }),
          }),
        ],
      }),
    [debug, accessToken, apiUrl],
  )
  ;(globalThis as any).trpcClient = trpcClient

  return (
    // TODO: Figure out the purpose of ssrState and ssrContext in trpc.Provider
    <_trpcReact.Provider queryClient={queryClient} client={trpcClient}>
      {children}
    </_trpcReact.Provider>
  )
}

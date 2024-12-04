import {createTRPCProxyClient, httpBatchLink, httpLink} from '@trpc/client'
import type {FlatRouter} from '@openint/engine-backend'

export function createAppTrpcClient({
  debug,
  apiUrl,
  accessToken,
}: {
  debug?: boolean
  apiUrl?: string
  accessToken?: string | null
}) {
  return createTRPCProxyClient<FlatRouter>({
    links: [
      (debug || true ? httpLink : httpBatchLink)({
        url: apiUrl ?? '/api/trpc',
        headers: () => ({
          ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
        }),
      }),
    ],
  })
}

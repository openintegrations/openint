import {createTRPCProxyClient, httpBatchLink, httpLink} from '@trpc/client'
import type {FlatRouter} from '@openint/engine-backend'
// TODO: Fix this import that breaks package boundary by moving openInt headers somewhere up
// the dependency chain
import type {OpenIntHeaders} from '../../api'

export function createAppTrpcClient({
  debug,
  apiUrl,
  accessToken,
  headers,
}: {
  debug?: boolean
  apiUrl?: string
  accessToken?: string | null
  headers?: OpenIntHeaders
}) {
  return createTRPCProxyClient<FlatRouter>({
    links: [
      (debug || true ? httpLink : httpBatchLink)({
        url: apiUrl ?? '/api/trpc',
        headers: () => ({
          ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {}),
          ...(headers as Record<string, string | undefined>),
        }),
      }),
    ],
  })
}

import {createTRPCClient, httpLink} from '@trpc/client'
import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {envRequired} from '@openint/env'
import {
  createFetchHandlerTRPC,
  type CreateFetchHandlerOptions,
} from '../trpc/handlers'
import {type AppRouter} from '../trpc/routers'

export function headersForViewer(viewer: Viewer) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer.role === 'anon'
    ? {}
    : {authorization: `Bearer ${jwt.signViewer(viewer)}`}
}

export function getTestTRPCClient(
  ctx: Omit<CreateFetchHandlerOptions, 'endpoint'>,
  viewer: Viewer,
) {
  const handler = createFetchHandlerTRPC({...ctx, endpoint: '/api/v1/trpc'})
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost/api/v1/trpc',
        fetch: (input, init) => handler(new Request(input, init)),
        headers: headersForViewer(viewer),
      }),
    ],
  })
}

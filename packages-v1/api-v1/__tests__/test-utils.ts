import {createTRPCClient, httpLink} from '@trpc/client'
import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {envRequired} from '@openint/env'
import {createApp} from '../app'
import type {CreateFetchHandlerOptions} from '../trpc/handlers'
import {createFetchHandlerTRPC} from '../trpc/handlers'
import {type AppRouter} from '../trpc/routers'

export async function headersForViewer(viewer: Viewer) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer.role === 'anon'
    ? {}
    : {authorization: `Bearer ${await jwt.signViewer(viewer)}`}
}

/** Prefer to operate at the highest level of stack possible while still bienbeing performant */
export function getTestTRPCClient(
  {router, ...opts}: Omit<CreateFetchHandlerOptions, 'endpoint'>,
  viewer: Viewer,
) {
  const handler = router
    ? createFetchHandlerTRPC({...opts, router, endpoint: '/api/v1/trpc'})
    : createApp(opts).handle

  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost/api/v1/trpc',
        fetch: (input, init) => handler(new Request(input, init)),
        headers: () => headersForViewer(viewer),
      }),
    ],
  })
}

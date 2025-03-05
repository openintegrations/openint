import {createTRPCClient, httpLink} from '@trpc/client'
import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {Database} from '@openint/db'
import {envRequired} from '@openint/env'
import {createFetchHandlerTRPC} from '../trpc/handlers'
import type {AppRouter} from '../trpc/routers'

export function headersForViewer(viewer: Viewer | null) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer ? {authorization: `Bearer ${jwt.signViewer(viewer)}`} : {}
}

export function getTrpcClient(db: Database, viewer: Viewer | null) {
  const handler = createFetchHandlerTRPC({endpoint: '/api/v1/trpc', db})
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

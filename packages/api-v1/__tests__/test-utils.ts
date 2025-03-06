import {createTRPCClient, httpLink} from '@trpc/client'
import type {Elysia} from 'elysia'
import type {Viewer} from '@openint/cdk'
import {makeJwtClient} from '@openint/cdk'
import {envRequired} from '@openint/env'
import {createApp} from '../app'
import type {CreateFetchHandlerOptions} from '../trpc/handlers'
import {createFetchHandlerTRPC} from '../trpc/handlers'
import {type AppRouter} from '../trpc/routers'

export function headersForViewer(viewer: Viewer) {
  const jwt = makeJwtClient({secretOrPublicKey: envRequired.JWT_SECRET})
  return viewer.role === 'anon'
    ? {}
    : {authorization: `Bearer ${jwt.signViewer(viewer)}`}
}

/** Prefer to operate at the highest level of stack possible while still bienbeing performant */
export function getTestTRPCClient(
  {router, ...opts}: Omit<CreateFetchHandlerOptions, 'endpoint'>,
  viewerOrKey: Viewer | {api_key: string},
) {
  const handler = router
    ? createFetchHandlerTRPC({...opts, router, endpoint: '/api/v1/trpc'})
    : createApp(opts).handle

  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: 'http://localhost/api/v1/trpc',
        fetch: (input, init) => handler(new Request(input, init)),
        headers:
          'api_key' in viewerOrKey
            ? {authorization: `Bearer ${viewerOrKey.api_key}`}
            : headersForViewer(viewerOrKey),
      }),
    ],
  })
}

/** 0 means random, but not supported by node adapter */
export const listenWithPort = (app: Elysia, port = 0) =>
  new Promise<number>((resolve) => {
    app.listen(port, (server) => {
      resolve(server.port)
    })
  })

export const getRandomPort = (min = 10000, max = 65535) =>
  Math.floor(Math.random() * (max - min + 1)) + min

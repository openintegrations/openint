import type {AnyTRPCRouter} from '@trpc/server'
import type {after} from 'next/server'
import type {Viewer} from '@openint/cdk'
import type {Database} from '@openint/db'

import {modifyRequest} from '@opensdks/fetch-links'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
// Technically doesn't belong here as it introduces circular dependencies
import {routerContextFromRequest, routerContextFromViewer} from './context'
import {onError} from './error-handling'
import {appRouter} from './routers'

export interface CreateFetchHandlerOptions {
  endpoint: `/${string}`
  router?: AnyTRPCRouter
  // Think about the types a bit more, kind of confusing as is
  db: Database
  // TODO: Dedupe these properties with routerContextFromRequest types
  /** Additional viewer to use for the request not part of the authorization header */
  getAdditionalViewer?: () => Promise<Viewer>
  /** Await async tasks after the main request has completed */
  after?: typeof after
}

export const createFetchHandlerTRPC =
  ({endpoint, router, ...opts}: CreateFetchHandlerOptions) =>
  (req: Request) => {
    console.log('handleTrpcRequest', req.url, endpoint)
    return fetchRequestHandler({
      router: router ?? appRouter,
      createContext: () => routerContextFromRequest({...opts, req}),
      endpoint,
      req,
      onError,
    })
  }

export const createFetchHandlerOpenAPI =
  ({endpoint, router, ...opts}: CreateFetchHandlerOptions) =>
  async (_req: Request) => {
    console.log('handleOpenApiRequest', _req.url, endpoint)

    // Hack to ensure that the request body is always JSON for post request
    let req = _req
    if (req.method === 'POST' && req.headers.get('content-type') == null) {
      const body = await req.text()
      const headers = new Headers(req.headers)
      headers.set('content-type', 'application/json')
      req = modifyRequest(req, {body: body || JSON.stringify({}), headers})
    }

    return createOpenApiFetchHandler({
      router: router ?? appRouter,
      createContext: () => routerContextFromRequest({...opts, req}),
      endpoint,
      req,
      onError,
    })
  }

/**
 * When testing,
 * - trpc client is preferred to ensure request response goes through the whole handler,
 * - trpc caller is optimized for max performance while still consistency through api handling
 */
export function createTRPCCaller(
  /** Not able to support custom router at the moment, cannot get types to work */
  ctx: Omit<CreateFetchHandlerOptions, 'endpoint' | 'router'>,
  viewer: Viewer,
) {
  return appRouter.createCaller(routerContextFromViewer({...ctx, viewer}), {
    onError,
  })
}

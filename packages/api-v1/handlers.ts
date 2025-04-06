import type {AnyTRPCRouter} from '@trpc/server'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
import type {Viewer} from '@openint/cdk'
import type {Database} from '@openint/db'
// Technically doesn't belong here as it introduces circular dependencies
import {appRouter} from './routers'
import {routerContextFromRequest, routerContextFromViewer} from './trpc/context'
import {onError} from './trpc/error-handling'

export interface CreateFetchHandlerOptions {
  endpoint: `/${string}`
  router?: AnyTRPCRouter
  // Think about the types a bit more, kind of confusing as is
  db: Database
  /** Additional viewer to use for the request not part of the authorization header */
  getAdditionalViewer?: () => Promise<Viewer>
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
  (req: Request) => {
    console.log('handleOpenApiRequest', req.url, endpoint)
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

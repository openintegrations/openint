import type {AnyTRPCRouter} from '@trpc/server'
import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
import type {Viewer} from '@openint/cdk'
import type {Database} from '@openint/db'
import {routerContextFromRequest, routerContextFromViewer} from './context'
import {appRouter} from './routers'

export interface CreateFetchHandlerOptions {
  endpoint: `/${string}`
  db: Database
  router?: AnyTRPCRouter
}

export const createFetchHandlerTRPC =
  (opts: CreateFetchHandlerOptions) => (req: Request) => {
    console.log('handleTrpcRequest', req.url, opts.endpoint)
    return fetchRequestHandler({
      router: opts.router ?? appRouter,
      createContext: () => routerContextFromRequest({req, db: opts.db}),
      endpoint: opts.endpoint,
      req,
    })
  }

export const createFetchHandlerOpenAPI =
  (opts: CreateFetchHandlerOptions) => (req: Request) => {
    console.log('handleOpenApiRequest', req.url, opts.endpoint)
    return createOpenApiFetchHandler({
      router: opts.router ?? appRouter,
      createContext: () => routerContextFromRequest({req, db: opts.db}),
      endpoint: opts.endpoint,
      req,
    })
  }

/**
 * When testing, generally testTRPClient is preferred to ensure request response
 * goes through the whole handler
 */
export function createTRPCCaller(
  /** Not able to support custom router at the moment, cannot get types to work */
  ctx: Omit<CreateFetchHandlerOptions, 'endpoint' | 'router'>,
  viewer: Viewer,
) {
  return appRouter.createCaller(routerContextFromViewer({...ctx, viewer}))
}

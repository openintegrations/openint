import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
import {Database} from '@openint/db'
import {createRouterContext} from './context'
import {appRouter} from './routers'

export interface CreateFetchHandlerOptions {
  endpoint: `/${string}`
  db: Database
}

export const createFetchHandlerTRPC =
  (opts: CreateFetchHandlerOptions) => (req: Request) => {
    console.log('handleTrpcRequest', req.url)
    return fetchRequestHandler({
      router: appRouter,
      createContext: () => createRouterContext({req, db: opts.db}),
      endpoint: opts.endpoint,
      req,
    })
  }

export const createFetchHandlerOpenAPI =
  (opts: CreateFetchHandlerOptions) => (req: Request) => {
    console.log('handleOpenApiRequest', req.url)
    return createOpenApiFetchHandler({
      router: appRouter,
      createContext: () => createRouterContext({req, db: opts.db}),
      endpoint: opts.endpoint,
      req,
    })
  }

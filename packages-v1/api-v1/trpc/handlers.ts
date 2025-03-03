import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
import {contextFromRequest} from './context'
import {appRouter} from './routers'

export const createFetchHandlerTRPC =
  (opts: {endpoint: `/${string}`}) => (req: Request) => {
    console.log('handleTrpcRequest', req.url)
    return fetchRequestHandler({
      router: appRouter,
      createContext: () => contextFromRequest(req),
      endpoint: opts.endpoint,
      req,
    })
  }

export const createFetchHandlerOpenAPI =
  (opts: {endpoint: `/${string}`}) => (req: Request) => {
    console.log('handleOpenApiRequest', req.url)
    return createOpenApiFetchHandler({
      router: appRouter,
      createContext: () => contextFromRequest(req),
      endpoint: opts.endpoint,
      req,
    })
  }

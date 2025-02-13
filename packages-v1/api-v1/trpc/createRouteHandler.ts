import {fetchRequestHandler} from '@trpc/server/adapters/fetch'
import {createOpenApiFetchHandler} from 'trpc-to-openapi'
import {appRouter} from './appRouter'

function contextFromRequest(_req: Request) {
  return {viewer: {role: 'system' as const}}
}

export const handleTrpcRequest = (req: Request) => {
  console.log('handleTrpcRequest', req.url)
  return fetchRequestHandler({
    router: appRouter,
    createContext: () => contextFromRequest(req),
    endpoint: '/', // '/api/trpc', Assume we are hosted at root and let middleware handle prefixing
    req,
  })
}

export const handleOpenApiRequest = (req: Request) => {
  console.log('handleOpenApiRequest', req.url)
  return createOpenApiFetchHandler({
    router: appRouter,
    createContext: () => contextFromRequest(req),
    endpoint: '/', // '/api/v1', Assume we are hosted at root and let middleware handle prefixing
    req,
  })
}

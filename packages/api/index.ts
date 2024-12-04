import {appRouter} from './appRouter'
import {
  createRouterOpenAPIHandler,
  createRouterTRPCHandler,
} from './createRouterHandler'

export * from './appRouter'
export * from './createRouterHandler'
export * from './proxyHandler'

// TODO: Make me work
export function createAppOpenAPIHandler(opts: {endpoint: `/${string}`}) {
  return createRouterOpenAPIHandler({...opts, router: appRouter})
}

export function createAppTrpcHandler(opts: {endpoint: `/${string}`}) {
  return createRouterTRPCHandler({...opts, router: appRouter})
}

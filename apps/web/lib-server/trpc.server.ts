import type {Viewer} from '@openint/cdk'
import type {PageProps} from '@/lib-common/next-utils'

import {createTRPCOptionsProxy} from '@trpc/tanstack-react-query'
import {appRouter, createTRPCCaller} from '@openint/api-v1'
import {routerContextFromViewer} from '@openint/api-v1/trpc/context'
import {getServerQueryClient} from '@/lib-common/trpc.common'
import {currentViewer} from './auth.server'
import {db} from './globals'

// MARK: - direct router calls. Less preferred

export type APICaller = ReturnType<typeof createTRPCCaller>

/** @deprecated Use getTRPCOptionsProxy instead */
export function createAPICaller(viewer: Viewer) {
  return createTRPCCaller({db}, viewer)
}

// MARK: - query client based, preferred

/** Prefer the explicit getServerComponentContext instead */
export const trpcOptionsProxy = createTRPCOptionsProxy({
  ctx: async () => {
    // No access to pageProps here unfortunately. so this only works from cookies
    // There should really be a way to put viewer globally somehow per request
    // just like await headers
    const {viewer} = await currentViewer(undefined)
    const context = routerContextFromViewer({viewer, db})
    return context
  },
  // TODO: Test error handling behavior with options proxy
  router: appRouter,
  queryClient: getServerQueryClient,
})

// TODO: Move this to a separate file?
export async function getServerComponentContext(pageProps: PageProps) {
  const {viewer, token, payload} = await currentViewer(pageProps)
  const ctx = serverComponentContextForViewer(viewer)
  return {...ctx, token, tokenPayload: payload}
}

export function serverComponentContextForViewer(viewer: Viewer) {
  const queryClient = getServerQueryClient()
  const ctx = routerContextFromViewer({viewer, db})
  const trpc = createTRPCOptionsProxy({ctx, queryClient, router: appRouter})
  return {...ctx, queryClient, trpc}
}

// TODO: Add a serverComponent context that extends routerContext and make it available to server components also
// including caller, and trpcOptionsProxy, and query client
// perhaps this can be in globals?

// serverCompoentContextForViewer
// servercomponentContextForPageProps
// servercomponentContextFromCookie

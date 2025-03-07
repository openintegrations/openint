import {initTRPC, TRPCError} from '@trpc/server'
import {type OpenApiMeta} from 'trpc-to-openapi'
import {hasRole, type Viewer} from '@openint/cdk'
import type {AnyDrizzle} from '@openint/db/db'

export interface ViewerContext<T extends Viewer = Viewer> {
  viewer: T
  db: AnyDrizzle
}

export interface RouterContext<T extends Viewer = Viewer>
  extends ViewerContext<T> {
  as: (viewer: Viewer) => ViewerContext
}

export const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<RouterContext>()
  .create({allowOutsideOfServer: true})

export const router = trpc.router
export const publicProcedure = trpc.procedure

export const authenticatedProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(viewer, ['customer', 'user', 'org'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Authentication required'})
  }
  return next({ctx: {...ctx, viewer}})
})

export const customerProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(viewer, ['customer'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Customer only'})
  }
  return next({ctx: {...ctx, viewer}})
})

export const orgProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(viewer, ['user', 'org'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Admin only'})
  }
  if (!viewer.orgId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `orgId missing in token for user ${viewer.userId}`,
    })
  }
  return next({
    ctx: {
      ...ctx,
      viewer: viewer as WithRequiredNonNull<Viewer<'user' | 'org'>, 'orgId'>,
    },
  })
})

type WithRequiredNonNull<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>
}

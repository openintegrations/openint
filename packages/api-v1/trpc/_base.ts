import {initTRPC, TRPCError} from '@trpc/server'
import {type OpenApiMeta} from 'trpc-to-openapi'
import {hasRole, type Viewer} from '@openint/cdk'
import type {RouterContext} from './context'

export interface RouterMeta extends OpenApiMeta {
  /**
   * Indicate whether this is an internal API and
   * should therefore not be generated as part of the OpenAPI spec
   */
  internal?: boolean
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
  if (!hasRole(viewer, ['customer', 'user'])) {
    // TODO: Figure out how to user impersonating as customer
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

export const adminProcedure = publicProcedure.use(({next, ctx}) => {
  if (!hasRole(ctx.viewer, ['user', 'org', 'system'])) {
    throw new TRPCError({
      code: ctx.viewer.role === 'anon' ? 'UNAUTHORIZED' : 'FORBIDDEN',
    })
  }
  return next({ctx: {...ctx, viewer: ctx.viewer}})
})

type WithRequiredNonNull<T, K extends keyof T> = T & {
  [P in K]-?: NonNullable<T[P]>
}

import {initTRPC, TRPCError} from '@trpc/server'
import {type OpenApiMeta} from 'trpc-to-openapi'
import {hasRole, type Viewer} from '@openint/cdk'
import type {Database} from '@openint/db-v1'

export interface RouterContext {
  viewer: Viewer
  db: Database
}

export const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<RouterContext>()
  .create()

export const router = trpc.router
export const publicProcedure = trpc.procedure

export const authenticatedProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(viewer, ['customer', 'user', 'org'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Admin only'})
  }
  return next({ctx: {...ctx, viewer}})
})

export const customerProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(ctx.viewer, ['customer'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Customer only'})
  }
  return next({ctx: {...ctx, viewer}})
})

export const adminProcedure = publicProcedure.use(({next, ctx}) => {
  const viewer = ctx.viewer
  if (!hasRole(ctx.viewer, ['user', 'org'])) {
    throw new TRPCError({code: 'FORBIDDEN', message: 'Admin only'})
  }
  return next({ctx: {...ctx, viewer}})
})

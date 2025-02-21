import {initTRPC} from '@trpc/server'
import {type OpenApiMeta} from 'trpc-to-openapi'
import type {Viewer} from '@openint/cdk'

export interface RouterContext {
  viewer: Viewer
}

export const trpc = initTRPC.meta<OpenApiMeta>().context<RouterContext>().create()

export const router = trpc.router
export const publicProcedure = trpc.procedure

import {initTRPC} from '@trpc/server'
import {type OpenApiMeta} from 'trpc-to-openapi'
import type {Viewer} from '@openint/cdk'

export interface RouterContext {
  viewer: Viewer
}

const t = initTRPC.meta<OpenApiMeta>().context<RouterContext>().create()

export const router = t.router
export const publicProcedure = t.procedure

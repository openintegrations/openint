import {z} from 'zod'
import {zViewer} from '@openint/cdk'
import {publicProcedure, router, trpc} from '../_base'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {eventRouter} from './event'

const generalRouter = router({
  health: publicProcedure
    .meta({openapi: {method: 'GET', path: '/health'}})
    .input(z.void())
    .output(z.object({ok: z.boolean()}))
    .query(() => ({ok: true})),
  viewer: publicProcedure
    .meta({openapi: {method: 'GET', path: '/viewer'}})
    .input(z.void())
    .output(zViewer)
    .query(({ctx}) => ctx.viewer),
})

export const zListParams = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
})

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  eventRouter,
  generalRouter,
)

export type AppRouter = typeof appRouter

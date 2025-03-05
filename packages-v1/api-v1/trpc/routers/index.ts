import {z} from 'zod'
import {zViewer} from '@openint/cdk'
import {publicProcedure, router, trpc} from '../_base'
import {connectRouter} from './connect'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {eventRouter} from './event'

const generalRouter = router({
  health: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        description: 'Check if the API is operational',
        summary: 'Health Check',
      },
    })
    .input(z.void())
    .output(z.object({ok: z.boolean()}))
    .query(() => ({ok: true})),
  viewer: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/viewer',
        description: 'Get information about the current authenticated user',
        summary: 'Get Current User',
      },
    })
    .input(z.void())
    .output(zViewer)
    .query(({ctx}) => ctx.viewer),
})

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  eventRouter,
  generalRouter,
  connectRouter,
)

export type AppRouter = typeof appRouter

import {z} from 'zod'
import {publicProcedure, router, trpc} from '../_base'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'

const generalRouter = router({
  health: publicProcedure
    .meta({openapi: {method: 'GET', path: '/health'}})
    .input(z.void())
    .output(z.string())
    .query(() => 'ok'),
})

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  generalRouter,
)

export type AppRouter = typeof appRouter

import {z} from 'zod'
import {publicProcedure, router, trpc} from '../_base'
import {core} from '../../models'

const connectionRouter = router({
  listConnections: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connection'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.connection),
      }),
    )
    .query(() => ({items: []})),
})

const connectorConfigRouter = router({
  listConnectorConfigs: publicProcedure
    .meta({
      openapi: {method: 'GET', path: '/connector-config'},
    })
    .input(z.void())
    .output(
      z.object({
        items: z.array(core.connector_config),
      }),
    )
    .query(() => ({items: []})),
})

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

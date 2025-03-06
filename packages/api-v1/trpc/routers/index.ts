import {z} from 'zod'
import {publicProcedure, router, trpc} from '../_base'
import {connectionRouter} from './connection'
import {connectorConfigRouter} from './connectorConfig'
import {customerRouter} from './customer'
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

  healthEcho: publicProcedure
    .meta({openapi: {method: 'POST', path: '/health'}})
    .input(z.object({}).passthrough())
    .output(z.object({}).passthrough())
    .mutation(({input}) => ({input})),

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
    // note: not returning zViewer as it seems to be tripping up the stainless sdk generation
    .output(z.object({role: z.enum(['customer', 'org', 'anon'])}))
    // @ts-expect-error
    .query(({ctx}) => {
      console.log('ctx', ctx)
      return {role: ctx.viewer.role}
    }),
})

export const appRouter = trpc.mergeRouters(
  connectionRouter,
  connectorConfigRouter,
  eventRouter,
  generalRouter,
  customerRouter,
)

export type AppRouter = typeof appRouter

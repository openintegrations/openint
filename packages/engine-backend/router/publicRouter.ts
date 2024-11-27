import {zodToOas31Schema} from '@opensdks/util-zod'
import {TRPCError} from '@trpc/server'
import {zRaw} from '@openint/cdk'
import {R, z} from '@openint/util'
import {contextFactory} from '../../../apps/app-config/backendConfig'
import {publicProcedure, trpc} from './_base'

export const publicRouter = trpc.router({
  health: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        tags: ['Internal'],
        summary: 'Health check',
      },
    })
    .input(z.object({exp: z.boolean().optional()}))
    .output(z.object({healthy: z.boolean(), error: z.string().optional()}))
    .query(async ({input: {exp}}) => {
      const result = await contextFactory
        .fromViewer({role: 'anon'})
        .services.metaService.isHealthy(exp)

      if (!result.healthy) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: result.error,
        })
      }

      return result
    }),
  getPublicEnv: publicProcedure.query(({ctx}) =>
    R.pick(ctx.env, ['NEXT_PUBLIC_NANGO_PUBLIC_KEY']),
  ),
  getRawSchemas: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/debug/raw-schemas',
        tags: ['Internal'],
        description: 'Get raw schemas',
      },
    })
    .input(z.void())
    .output(z.unknown())
    .query(() => R.mapValues(zRaw, (zodSchema) => zodToOas31Schema(zodSchema))),
})

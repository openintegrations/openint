import {zodToOas31Schema} from '@opensdks/util-zod'
import {TRPCError} from '@trpc/server'
import {zRaw} from '@openint/cdk'
import {R, z} from '@openint/util'
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
    .input(z.object({exp: z.boolean().optional()}).optional())
    .output(z.object({healthy: z.boolean(), error: z.string().optional()}))
    .query(async ({input, ctx}) => {
      if (process.env['MOCK_HEALTHCHECK']) {
        return {healthy: true}
      }

      const result = await ctx.as('anon', {}).metaService.isHealthy(input?.exp)

      if (!result.healthy) {
        throw new Error(result.error)
      }

      return result
    }),
  getPublicEnv: publicProcedure.query(({ctx}) =>
    R.pick(ctx.env, ['NEXT_PUBLIC_NANGO_PUBLIC_KEY']),
  ),
  getRawSchemas: publicProcedure
    // .meta({
    //   openapi: {
    //     method: 'GET',
    //     path: '/debug/raw-schemas',
    //     tags: ['Internal'],
    //     description: 'Get raw schemas',
    //   },
    // })
    .input(z.void())
    .output(z.unknown())
    .query(() => R.mapValues(zRaw, (zodSchema) => zodToOas31Schema(zodSchema))),

  /**
   * > http://localhost:4000/api/trpc/createClerkTestingToken?input={"secret": "$secret"}
   * < {"result":{"data":{"testing_token":"xxxxx"},"}}
   */
  createClerkTestingToken: publicProcedure
    .input(z.object({secret: z.string()}))
    .query(async ({input, ctx}) => {
      if (!ctx.env.INTEGRATION_TEST_SECRET) {
        throw new TRPCError({
          code: 'METHOD_NOT_SUPPORTED',
          message: 'No INTEGRATION_TEST_SECRET configured',
        })
      }
      if (input.secret !== ctx.env.INTEGRATION_TEST_SECRET) {
        throw new TRPCError({code: 'UNAUTHORIZED'})
      }
      const res = await ctx.clerk.testingTokens.createTestingToken()
      return {testing_token: res.token}
    }),
})

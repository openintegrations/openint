import {TRPCError} from '@trpc/server'
import {zRaw} from '@openint/cdk'
import {R, z} from '@openint/util'
import {zodToOas31Schema} from '@openint/util/schema'
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
    .output(
      z.object({
        healthy: z.boolean(),
        error: z.string().optional(),
        dbRoundtrip: z.number(),
        deps: z
          .object({
            nango: z.boolean(),
            inngest: z.boolean(),
            clerk: z.boolean(),
          })
          .optional(),
      }),
    )
    .query(async ({input, ctx}) => {
      if (process.env['MOCK_HEALTHCHECK']) {
        return {healthy: true, dbRoundtrip: -1}
      }

      // Measure only the metaService.isHealthy call
      const startTime = Date.now()
      const result = await ctx.as('anon', {}).metaService.isHealthy(input?.exp)
      const dbRoundtrip = Date.now() - startTime

      // Perform external checks separately
      const externalChecks = await Promise.allSettled([
        fetch('https://api.nango.dev/health').then((r) => r.ok),
        fetch('https://api.inngest.com/health').then((r) => r.ok),
        fetch('https://api.clerk.com/v1/health').then((r) => r.ok),
      ])

      if (!result.healthy) {
        throw new Error(result.error)
      }

      return {
        ...result,
        dbRoundtrip,
        deps: {
          nango:
            externalChecks[0].status === 'fulfilled' && externalChecks[0].value,
          inngest:
            externalChecks[1].status === 'fulfilled' && externalChecks[1].value,
          clerk:
            externalChecks[2].status === 'fulfilled' && externalChecks[2].value,
        },
      }
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
   * > http://localhost:4000/api/v0/trpc/createClerkTestingToken?input={"secret": "$secret"}
   * < {"result":{"data":{"testing_token":"xxxxx"},"}}
   */
  createClerkTestingToken: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/clerk-testing-token',
        tags: ['Internal'],
      },
    })
    .input(z.object({secret: z.string()}))
    .output(z.object({testing_token: z.string()}))
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

import {TRPCError} from '@trpc/server'
import {zViewerRole} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {z} from '@openint/util/zod-utils'
import {publicProcedure, router} from '../_base'
import {routerContextFromViewer} from '../context'

export const generalRouter = router({
  debug: publicProcedure
    .meta({openapi: {method: 'GET', path: '/debug', enabled: false}})
    .input(z.object({crash: z.string().optional()}))
    .output(z.object({ok: z.boolean()}))
    .query(({input}) => {
      if (input.crash) {
        throw new Error(input.crash)
      }
      return {ok: true}
    }),

  health: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        description: 'Check if the API is operational',
        summary: 'Health Check',
        enabled: false,
        // Normally these would be disabled as they are internal endpoints but
        // since we use them for tests of oas generation we leave them on
        // and then hardcode remove it form docs in generateDocsOas.bin.cjs
        // enabled: false,
      },
    })
    .input(z.void())
    .output(z.object({ok: z.boolean()}))
    .query(async () => {
      const db = initDbNeon(envRequired.DATABASE_URL)
      const ctx = routerContextFromViewer({db, viewer: {role: 'system'}})
      const INTEGRATION_TEST_ORG_ID = 'org_2owpNzLGQbIKvcpHnyfNivjXcDu'
      const connections = await ctx.db
        .select({
          id: schema.connection.id,
          status: schema.connection.status,
        })
        .from(schema.connection)
        .innerJoin(
          schema.connector_config,
          eq(schema.connection.connector_config_id, schema.connector_config.id),
        )
        .where(eq(schema.connector_config.org_id, INTEGRATION_TEST_ORG_ID))

      const unhealthyConnections = connections.filter(
        (c) => c.status !== null && c.status !== 'healthy',
      )

      if (unhealthyConnections.length > 0) {
        console.error(
          'Unhealthy connections in integration test account',
          unhealthyConnections,
        )
        throw new TRPCError({
          code: 'SERVICE_UNAVAILABLE',
          message: `Unhealthy connections in integration test account: ${unhealthyConnections.map((c) => c.id + ` (${c.status})`).join(', ')}`,
        })
      }

      return {
        ok: true,
      }
    }),

  healthEcho: publicProcedure
    // Normally these would be disabled as they are internal endpoints but
    // since we use them for tests of oas generation we leave them on
    // and then hardcode remove it form docs in generateDocsOas.bin.cjs
    // enabled: false,
    .meta({openapi: {method: 'POST', path: '/health'}})
    .input(z.object({}).passthrough())
    .output(z.object({}).passthrough())
    .mutation(({input}) => ({input})),

  // Uncomment me to debug server environment variables
  // env: publicProcedure
  //   .meta({openapi: {method: 'GET', path: '/env'}})
  //   .input(z.void())
  //   .output(z.object({}).passthrough())
  //   .mutation(() => ({
  //     env,
  //     baseURLs: getBaseURLs(null),
  //     serverURL: _getServerUrl(null),
  //   })),

  viewer: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/viewer',
        description: 'Get information about the current authenticated user',
        summary: 'Get Current User',
        // Normally these would be disabled as they are internal endpoints but
        // since we use them for tests of oas generation we leave them on
        // and then hardcode remove it form docs in generateDocsOas.bin.cjs
        // enabled: false,
      },
    })
    .input(z.void())
    // note: not returning zViewer as it seems to be tripping up the stainless sdk generation
    .output(z.object({role: zViewerRole}).passthrough())
    .query(({ctx}) => ctx.viewer),
})

import {readFileSync} from 'node:fs'
import {join} from 'node:path'

import {TRPCError} from '@trpc/server'
import Mustache from 'mustache'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {zViewerRole} from '@openint/cdk'
import {eq, schema} from '@openint/db'
import {initDbNeon} from '@openint/db/db.neon'
import {envRequired} from '@openint/env'
import {R} from '@openint/util/remeda'
import {z} from '@openint/util/zod-utils'
import {publicProcedure, router} from '../_base'
import {routerContextFromViewer} from '../context'
import {getConnectorModel} from './connector.models'

export const generalRouter = router({
  debug: publicProcedure
    .meta({openapi: {method: 'GET', path: '/debug', enabled: false}})
    .input(
      z.object({
        crash: z.string().optional(),
        task: z.string().optional(),
      }),
    )
    .output(z.object({ok: z.boolean(), rendered: z.string().optional()}))
    .query(({input}) => {
      if (input.crash) {
        throw new Error(input.crash)
      }

      const templatePath = join(__dirname, '../templates/test.moustache')
      const template = readFileSync(templatePath, 'utf-8')
      const rendered = input.task
        ? Mustache.render(template, {task: input.task || 'Unknown task'})
        : undefined

      return {
        ok: true,
        rendered,
      }
    }),

  health: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health',
        description: 'Check if the API is operational',
        summary: 'Health Check',
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

  connectorStatus: publicProcedure
    .meta({openapi: {method: 'GET', path: '/connector-status', enabled: true}})
    .input(z.void())
    .output(
      z.object({
        list: z.array(
          z.object({
            name: z.string(),
            hasConnectionForOrg: z.boolean(),
            isHealthyForOrg: z.boolean(),
            hasDefaultCredentials: z.boolean(),
            complete: z.boolean(),
          }),
        ),
        numTotalConnectors: z.number(),
        numWithConnectionForOrg: z.number(),
        numHealthyForOrg: z.number(),
        numWithDefaultCredentials: z.number(),
        numComplete: z.number(),
      }),
    )
    .query(async ({ctx}) => {
      const INTEGRATION_TEST_ORG_ID = 'org_2owpNzLGQbIKvcpHnyfNivjXcDu'
      const db = ctx.as({role: 'system'}).db

      const orgConnectorConfigs = await db
        .select({
          id: schema.connector_config.id,
          connectorName: schema.connector_config.connector_name,
          orgId: schema.connector_config.org_id,
          connectionId: schema.connection.id,
          connectionStatus: schema.connection.status,
        })
        .from(schema.connector_config)
        .leftJoin(
          schema.connection,
          eq(schema.connection.connector_config_id, schema.connector_config.id),
        )

      const individualStatuses = Object.values(defConnectors).map((def) => {
        const model = getConnectorModel(def)
        const connectorName = model.name
        const configsForThisConnector = orgConnectorConfigs.filter(
          (c) => c.connectorName === connectorName,
        )

        const orgSpecificConfigs = configsForThisConnector.filter(
          (c) => c.orgId === INTEGRATION_TEST_ORG_ID,
        )

        const hasConnectionForOrg = orgSpecificConfigs.length > 0
        const isHealthyForOrg =
          hasConnectionForOrg &&
          orgSpecificConfigs.some((c) => c.connectionStatus === 'healthy')

        const hasDefaultCredentials = model.has_openint_credentials ?? false
        const complete =
          hasConnectionForOrg && isHealthyForOrg && hasDefaultCredentials

        return {
          name: connectorName,
          hasConnectionForOrg,
          isHealthyForOrg,
          hasDefaultCredentials,
          complete,
        }
      })

      const sortedList = R.sortBy(
        individualStatuses,
        [
          (r: (typeof individualStatuses)[0]) => r.hasDefaultCredentials,
          'desc',
        ],
        (r: (typeof individualStatuses)[0]) => r.name,
      )

      const numTotalConnectors = sortedList.length
      const numWithConnectionForOrg = sortedList.filter(
        (item) => item.hasConnectionForOrg,
      ).length
      const numHealthyForOrg = sortedList.filter(
        (item) => item.isHealthyForOrg,
      ).length
      const numWithDefaultCredentials = sortedList.filter(
        (item) => item.hasDefaultCredentials,
      ).length
      const numComplete = sortedList.filter((item) => item.complete).length

      return {
        numTotalConnectors,
        numWithConnectionForOrg,
        numHealthyForOrg,
        numWithDefaultCredentials,
        numComplete,
        list: sortedList,
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

  renderTestTemplate: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/render-test-template',
        description: 'Render the test template with additional text',
        summary: 'Render Test Template',
      },
    })
    .input(
      z.object({
        task: z.string().optional(),
      }),
    )
    .output(
      z.object({
        rendered: z.string(),
        text: z.string(),
      }),
    )
    .query(({input}) => {
      const templatePath = join(__dirname, '../templates/test.moustache')
      const template = readFileSync(templatePath, 'utf-8')
      const rendered = Mustache.render(template, {
        task: input.task || 'default task',
      })

      return {
        rendered,
        text: 'Additional text from the server',
      }
    }),
})

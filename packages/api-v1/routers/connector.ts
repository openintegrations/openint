import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import type {ConnectorMetadata} from '@openint/cdk'
import {zodToOas31Schema} from '@openint/ui-v1/components/schema-form/generateJSONSchema'
import type {Oas31Schema} from '@openint/ui-v1/components/schema-form/generateJSONSchema'
import {core} from '../models'
import {publicProcedure, router} from '../trpc/_base'

interface IntegrationsResponse {
  items: Array<Record<string, unknown>>
}

interface ListIntegrationsFunction {
  (params: any): Promise<IntegrationsResponse>
}

function isListIntegrationsFunction(
  value: unknown,
): value is ListIntegrationsFunction {
  return typeof value === 'function'
}

const connectorOutput = core.connector.extend({
  integrations: z.array(core.integration).optional(),
})

export const zExpandOptions = z
  .enum(['integrations'])
  .describe('Fields to expand connector with its integrations')

// Added the casting to guarantee that the array is not empty
const zConnectorName = z.enum(
  Object.keys(defConnectors) as [string, ...string[]],
)

export const connectorRouter = router({
  listConnectors: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector',
        description: 'List all connectors with optional filtering',
        summary: 'List all connectors',
      },
    })
    .input(
      z
        .object({
          expand: z.array(zExpandOptions).optional().default([]),
        })
        .optional(),
    )
    .output(
      z
        .array(connectorOutput)
        .describe('List of connectors with selected fields'),
    )
    .query(async ({input}) => {
      const promises = Object.entries(defConnectors).map(
        async ([name, connector]) => {
          const metadata = connector.metadata as ConnectorMetadata
          const result = {
            name,
            display_name: metadata?.displayName,
            logo_url: metadata?.logoUrl,
            stage: metadata?.stage,
            platforms: metadata?.platforms,
          } as z.infer<typeof connectorOutput>

          const server = serverConnectors[name as keyof typeof serverConnectors]
          if (
            input?.expand.includes('integrations') &&
            server &&
            'listIntegrations' in server
          ) {
            if (isListIntegrationsFunction(server.listIntegrations)) {
              try {
                const integrations = await server.listIntegrations({})

                if (
                  integrations &&
                  'items' in integrations &&
                  Array.isArray(integrations.items)
                ) {
                  result.integrations = integrations.items
                } else {
                  result.integrations = []
                }
              } catch (error) {
                throw new TRPCError({
                  code: 'INTERNAL_SERVER_ERROR',
                  message: `Error listing integrations for connector: ${name}`,
                })
              }
            } else {
              result.integrations = []
            }
          }

          return result
        },
      )
      return Promise.all(promises)
    }),
  getSchemaByName: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector/schema/{name}',
        description: 'Get the schema for a connector by name',
      },
    })
    .input(
      z.object({
        name: zConnectorName.describe(
          `String connector name.\n\nAvailable Options: ${Object.keys(
            defConnectors,
          )
            .map((name) => `\`${name}\``)
            .join(', ')}`,
        ),
      }),
    )
    .output(z.record(z.unknown()))
    .query(({input}) => {
      const {name} = input
      const connector = defConnectors[name as keyof typeof defConnectors]

      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector with name "${name}" not found`,
        })
      }

      const result: Record<string, Oas31Schema> = {}

      // Handle the case where connector.schemas is a single schema
      if (connector.schemas instanceof z.ZodType) {
        return zodToOas31Schema(connector.schemas)
      }

      // Handle the case where connector.schemas is a record of schemas
      if (typeof connector.schemas === 'object') {
        for (const [key, schema] of Object.entries(connector.schemas)) {
          if (schema instanceof z.ZodType) {
            result[key] = zodToOas31Schema(schema)
          }
        }
      }

      return result
    }),
})

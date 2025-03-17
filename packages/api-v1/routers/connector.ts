import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import type {ConnectorDef} from '@openint/cdk'
import {core} from '../models'
import {getConnectorModel} from '../models/connectorSchemas'
import {publicProcedure, router} from '../trpc/_base'
import {zListParams, zListResponse} from './utils/pagination'

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
      zListParams
        .extend({
          expand: z.array(zExpandOptions).optional().default([]),
        })
        .optional(),
    )
    .output(zListResponse(connectorOutput).describe('List of connectors'))
    .query(async ({input}) => {
      const {limit, offset} = input ?? {}
      const connectors = Object.entries(defConnectors).slice(
        offset ?? 0,
        (offset ?? 0) + (limit ?? 50),
      )
      const promises = connectors.map(async ([name, def]) => {
        const result: z.infer<typeof connectorOutput> = getConnectorModel(
          def as ConnectorDef,
          {
            includeSchemas: true,
          },
        )

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
      })
      return {
        total: Object.keys(defConnectors).length,
        items: await Promise.all(promises),
        offset,
        limit,
      }
    }),
  getConnectorByName: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/connector/{name}',
        description: 'Get a connector by name',
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
    .output(connectorOutput)
    .query(async ({input}) => {
      const connector = defConnectors[input.name as keyof typeof defConnectors]

      if (!connector) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Connector with name "${input.name}" not found`,
        })
      }

      return getConnectorModel(connector as ConnectorDef, {
        includeSchemas: true,
      })
    }),
})

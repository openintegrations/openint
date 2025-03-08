import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {ConnectorMetadata} from '@openint/cdk'
import {publicProcedure, router} from '../_base'
import {core} from '../../models'
import {zExpandOptions} from '../utils/connectorUtils'

type ConnectorOutputType = {
  name: string
  display_name?: string
  logo_url?: string
  stage?: string
  platforms?: string[]
  integrations?: Record<string, unknown>[]
}

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
          } as ConnectorOutputType

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
})

import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {ConnectorMetadata} from '@openint/cdk'
import {authenticatedProcedure, router} from '../_base'
import {zExpandOptions} from '../utils/connectorUtils'

type ConnectorOutputType = {
  name: string
  displayName?: string
  logoUrl?: string
  stage?: string
  platforms?: string[]
  integrations?: Record<string, unknown>[]
}

interface IntegrationsResponse {
  items: Array<Record<string, unknown>>
}

const connectorOutput = z.object({
  name: z.string(),
  displayName: z.string().optional(),
  logoUrl: z.string().optional(),
  stage: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  integrations: z.array(z.object({}).passthrough()).optional(),
})

export const connectorRouter = router({
  // TODO: This should be an unauthenticated procedure
  listConnectors: authenticatedProcedure
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
            displayName: metadata?.displayName,
            logoUrl: metadata?.logoUrl,
            stage: metadata?.stage,
            platforms: metadata?.platforms,
          } as ConnectorOutputType

          const server = serverConnectors[name as keyof typeof serverConnectors]
          if (
            input?.expand.includes('integrations') &&
            server &&
            'listIntegrations' in server &&
            typeof server.listIntegrations === 'function'
          ) {
            try {
              const listIntegrations = server.listIntegrations as (
                params: any,
              ) => Promise<IntegrationsResponse>
              const integrations = await listIntegrations({})

              result.integrations = integrations?.items || []
            } catch (error) {
              console.error(`Error fetching integrations for ${name}:`, error)
              result.integrations = []
            }
          }

          return result
        },
      )
      return Promise.all(promises)
    }),
})

import {TRPCError} from '@trpc/server'
import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {serverConnectors} from '@openint/all-connectors/connectors.server'
import {core} from '../../models'

export const zExpandOptions = z
  .enum(['connector', 'integrations'])
  .describe(
    'Fields to expand: connector (includes connector details), integrations (includes integrations details)',
  )

export const zConnectorName = z
  .enum(
    Object.keys(serverConnectors).filter((key) => key !== 'postgres') as [
      string,
      ...string[],
    ],
  )
  .describe('The name of the connector')

// temp ids
export const zConnectionId = z
  .string()
  .startsWith('conn_')
  .describe('The id of the connection, starts with `conn_`')
export const zConnectorConfigId = z
  .string()
  .startsWith('ccfg_')
  .describe('The id of the connector config, starts with `ccfg_`')

export const zCustomerId = z
  .string()
  .describe(
    'The id of the customer in your application. Ensure it is unique for that customer.',
  )

export async function expandConnector(
  connectorConfig: z.infer<typeof core.connector_config>,
) {
  const connectorName = connectorConfig.connector_name

  const connector = defConnectors[connectorName as keyof typeof defConnectors]
  if (!connector) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `Connector not found: ${connectorName}`,
    })
  }

  const logoUrl =
    connector.metadata &&
    'logoUrl' in connector.metadata &&
    connector.metadata.logoUrl?.startsWith('http')
      ? connector.metadata.logoUrl
      : connector.metadata && 'logoUrl' in connector.metadata
        ? // TODO: replace this with our own custom domain
          `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/${connector.metadata.logoUrl}`
        : undefined

  return {
    // TODO: add more fields?
    connector_name: connectorName,
    // TODO: add display_name?
    // display_name: connectorConfig.display_name,
    // TODO: add enabled?
    // enabled: connectorConfig.enabled,
    created_at: connectorConfig.created_at,
    updated_at: connectorConfig.updated_at,
    logo_url: logoUrl,
  }
}

interface IntegrationConfig {
  enabled?: boolean
  scopes?: string | string[]
  [key: string]: any
}

export function expandIntegrations(
  connectorConfig: z.infer<typeof core.connector_config>,
): Record<string, IntegrationConfig> | undefined {
  if (
    !connectorConfig ||
    !connectorConfig.config ||
    !connectorConfig.config.integrations
  ) {
    return undefined
  }

  const {integrations} = connectorConfig.config
  const enabledIntegrations = Object.entries(
    integrations as Record<string, IntegrationConfig>,
  )
    .filter(([_, config]) => config && config.enabled === true)
    .reduce(
      (acc, [key, config]) => {
        acc[key] = config
        return acc
      },
      {} as Record<string, IntegrationConfig>,
    )

  return Object.keys(enabledIntegrations).length > 0
    ? enabledIntegrations
    : undefined
}

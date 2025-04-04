import {z, type Z} from '@openint/util/zod-utils'
import {Core, core} from '../models'

export const connectorConfigExtensions = z.object({
  connector: core.connector.optional(),
  integrations: z.record(core.integration).optional(),
  connection_count: z.number().optional(),
})

export type ConnectorConfigExtensions = Z.infer<
  typeof connectorConfigExtensions
>

export const connectorConfigExtended = z.intersection(
  core.connector_config,
  connectorConfigExtensions,
)

export const zConnectorConfigExpandOption = z
  .enum([
    'connector',
    'connector.schemas',
    'connection_count',
    // TODO: Add enabled_integrations. Require a bit of thinking
    // 'enabled_integrations',
  ])
  .describe(
    'Fields to expand: connector (includes connector details), enabled_integrations (includes enabled integrations details)',
  )

// TODO: Think about this type a bit more...
export type ConnectorConfig<
  T extends keyof ConnectorConfigExtensions = keyof ConnectorConfigExtensions,
> = Core['connector_config'] & Partial<Pick<ConnectorConfigExtensions, T>>

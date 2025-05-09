import type {Z} from '@openint/util/zod-utils'
import type {Core} from '../../models'

import {z} from '@openint/util/zod-utils'
import {core} from '../../models'

export const connectorConfigExtensions = z.object({
  connector: core.connector.optional(),
  integrations: z.record(core.integration_select).optional(),
  connection_count: z.number().optional(),
})

export type ConnectorConfigExtensions = Z.infer<
  typeof connectorConfigExtensions
>

export const connectorConfigExtended = z.intersection(
  core.connector_config_select,
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
> = Core['connector_config_select'] &
  Partial<Pick<ConnectorConfigExtensions, T>>

// Disabled field schema
export const disabledSchema = z.object({
  disabled: z
    .boolean()
    .describe(
      'Disable connector config property, when disabled it will not be used in connect. Essentially a reversible soft-delete',
    )
    .openapi({
      title: 'Disabled',
      'ui:field': 'DisabledField',
    }),
})

// Advanced fields schema
export const advancedFieldsSchema = z.object({
  advanced_fields: z
    .object({
      display_name: z
        .string()
        .optional()
        .openapi({
          'ui:options': {
            title: 'Display Name',
            placeholder: 'Enter Display Name',
          },
        }),
      // Add other advanced fields here as needed
    })
    .describe('Additional configuration options for this connector')
    .openapi({
      title: 'Advanced Settings',
      'ui:field': 'AdvancedField',
    }),
})

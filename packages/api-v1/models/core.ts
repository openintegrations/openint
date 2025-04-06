import {createInsertSchema, createSelectSchema} from 'drizzle-zod'
import {schema} from '@openint/db'
import {z, type Z} from '@openint/util/zod-utils'
import {
  zConnector,
  zDiscriminatedConfig,
  zDiscriminatedSettings,
} from '../routers/connector.models'

const zMetadata = z.record(z.string(), z.unknown()).describe(`
  JSON object can can be used to associate arbitrary metadata to
  avoid needing a separate 1-1 table just for simple key values in your application.
  During updates this object will be shallowly merged
`)

const event_select = createSelectSchema(schema.event).openapi({
  ref: 'core.event',
})

const event_insert = createInsertSchema(schema.event).openapi({
  ref: 'core.event_insert',
})

const organization_select = createSelectSchema(schema.organization).openapi({
  ref: 'core.organization',
})

const connector_config_select = z
  .intersection(
    createSelectSchema(schema.connector_config).omit({
      config: true,
      connector_name: true,
      default_pipe_in: true,
      default_pipe_out: true,
      default_pipe_in_source_id: true,
      default_pipe_out_destination_id: true,
      env_name: true,
    }),
    zDiscriminatedConfig,
  )
  .openapi({ref: 'core.connector_config_select'})

const connector_config_insert = z
  .intersection(
    createInsertSchema(schema.connector_config).omit({
      config: true,
      default_pipe_in: true,
      default_pipe_out: true,
      org_id: true,
      id: true,
    }),
    zDiscriminatedConfig,
  )
  .openapi({ref: 'core.connector_config_insert'})

const coreBase = z.object({
  id: z.string(),
  updated_at: z.string(), // .datetime(), // TODO: Ensure date time format is respected
  created_at: z.string(), // .datetime(), // TODO: Ensure date time format is respected
})

// TODO: Move core models into individual files that correspond to each of the routers
// Should be more sustainable also and only keep certain field level data structure in here
export const core = {
  event_select,
  event_insert,
  organization_select,

  /** @deprecated Use connection_select and connection_insert instead */
  connection: z
    .intersection(
      coreBase
        .extend({
          // We have some older connections that don't have a connector_config_id
          // and only connector_name, assuming pure default connector_config_id
          connector_config_id: z.string().nullable(),
          customer_id: z.string(),
          integration_id: z.string().nullable(),
          metadata: zMetadata.nullish(),
        })
        .describe('Connection Base'),
      zDiscriminatedSettings,
    )
    .openapi({ref: 'core.connection', title: 'Connection'}),

  connector_config_select,
  connector_config_insert,
  /** @deprecated Use connector_config_select and connector_config_insert instead */
  connector_config: z

    .intersection(
      coreBase
        .extend({
          org_id: z.string(),
          display_name: z.string().nullable(),
          disabled: z.boolean().nullable(),
          metadata: zMetadata.nullish(),
        })
        .describe('Connector Config Base'),
      zDiscriminatedConfig,
    )
    .openapi({
      ref: 'core.connector_config',
      title: 'Connector Config',
    }),

  connector: zConnector.openapi({ref: 'core.connector', title: 'Connector'}),

  /** @deprecated Use integration_select and integration_insert instead */
  integration: z
    .object({
      connector_name: z.string(),
      name: z.string(),
      logo_url: z.string().nullish(),
      stage: z.enum(['alpha', 'beta', 'ga']).nullish(),
      platforms: z.array(z.enum(['web', 'mobile', 'desktop'])).nullish(),
      category: z.string().nullish(),
      auth_type: z.string().nullish(),
      version: z.string().nullish(),
    })
    .passthrough()
    .openapi({ref: 'core.integration', title: 'Integration'}),
  customer: coreBase
    .extend({
      id: z.string(),
      connection_count: z.number(),
    })
    .openapi({ref: 'core.customer', title: 'Customer'}),
}

export type Core = {
  [k in keyof typeof core]: Z.infer<(typeof core)[k]>
}

// MARK: - Connectors

interface ConnectorRelations {
  integrations: Array<Core['integration']>
}

export type ConnectorExpanded<K extends keyof ConnectorRelations> =
  Core['connector'] & Partial<Pick<ConnectorRelations, K>>

// MARK: - Connections

interface ConnectionRelations {
  connector_config: Core['connector_config']
  customer: Core['customer']
  connector: Core['connector']
  integration: Core['integration']
}

export type ConnectionExpanded<
  K extends keyof ConnectionRelations = keyof ConnectionRelations,
> = Core['connection'] & Partial<Pick<ConnectionRelations, K>>

// MARK: - Customer
export type Customer = Core['customer']

// MARK: - Event
export type Event = Core['event_select']

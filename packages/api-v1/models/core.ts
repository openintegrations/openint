import type {Z} from '@openint/util/zod-utils'

import {createInsertSchema, createSelectSchema} from 'drizzle-zod'
import {
  zDiscriminatedConfig,
  zDiscriminatedSettings,
} from '@openint/all-connectors/schemas'
import {zStandard} from '@openint/cdk'
import {schema} from '@openint/db'
import {z} from '@openint/util/zod-utils'
import {zConnector, zConnectorName} from '../trpc/routers/connector.models'

// TODO: make all metadata default to `{}` and not nullable to simplify typing
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

const connection_select = z
  .intersection(
    createSelectSchema(schema.connection)
      .omit({
        settings: true,
        connector_name: true,
        env_name: true, // not sure if we want this
        metadata: true,
        status: true,
      })
      .extend({
        status: zStandard.connection.shape.status,
        metadata: zMetadata.nullish(),
      }),
    zDiscriminatedSettings,
  )
  .openapi({ref: 'core.connection_select'})

const connection_insert = z
  .intersection(
    createInsertSchema(schema.connection)
      .omit({
        id: true,
        settings: true,
        env_name: true, // not sure if we want this
        metadata: true,
      })
      .extend({
        status: zStandard.connection.shape.status,
        metadata: zMetadata.nullish(),
      }),
    zDiscriminatedSettings,
  )
  .openapi({ref: 'core.connection_insert'})

const connector_config_select = z
  .intersection(
    createSelectSchema(schema.connector_config)
      .omit({
        config: true,
        connector_name: true,
        default_pipe_in: true,
        default_pipe_out: true,
        default_pipe_in_source_id: true,
        default_pipe_out_destination_id: true,
        env_name: true, // not sure if we want this
        metadata: true,
      })
      .extend({metadata: zMetadata.nullish()}),
    zDiscriminatedConfig,
  )
  .openapi({ref: 'core.connector_config_select'})

const connector_config_insert = z
  .intersection(
    createInsertSchema(schema.connector_config)
      .omit({
        id: true,
        config: true,
        default_pipe_in: true,
        default_pipe_out: true,
        org_id: true,
        metadata: true,
      })
      .extend({metadata: zMetadata.nullish()}),
    zDiscriminatedConfig,
  )
  .openapi({ref: 'core.connector_config_insert'})

const integration_select = createSelectSchema(schema.integration)
  .omit({
    connector_name: true,
  })
  .extend({
    connector_name: zConnectorName,
    // TODO: Actually implement me. These do not exist at the moment
    name: z.string(),
    logo_url: z.string().nullish(),
    stage: z.enum(['alpha', 'beta', 'ga']).nullish(),
    platforms: z.array(z.enum(['web', 'mobile', 'desktop'])).nullish(),
    category: z.string().nullish(),
    auth_type: z.string().nullish(),
    version: z.string().nullish(),
  })
  .openapi({ref: 'core.integration_select'})

const customer_select = createSelectSchema(schema.customer)
  .omit({
    org_id: true,
    metadata: true,
    // created_at: true,
    // updated_at: true,
  })
  .openapi({
    ref: 'core.customer_select',
  })

// TODO: Move core models into individual files that correspond to each of the routers
// Should be more sustainable also and only keep certain field level data structure in here
export const core = {
  organization_select,
  customer_select,

  event_select,
  event_insert,

  connection_select,
  connection_insert,

  connector_config_select,
  connector_config_insert,

  integration_select,

  connector: zConnector.openapi({ref: 'core.connector', title: 'Connector'}),
}

export type Core = {
  [k in keyof typeof core]: Z.infer<(typeof core)[k]>
}

// MARK: - Connectors

interface ConnectorRelations {
  integrations: Array<Core['integration_select']>
}

export type ConnectorExpanded<K extends keyof ConnectorRelations> =
  Core['connector'] & Partial<Pick<ConnectorRelations, K>>

// MARK: - Connections

// MARK: - Customer
export type Customer = Core['customer_select']

// MARK: - Event
export type Event = Core['event_select']

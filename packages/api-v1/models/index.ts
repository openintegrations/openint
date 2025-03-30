import {createInsertSchema, createSelectSchema} from 'drizzle-zod'
import {z} from 'zod'
import {extendZodWithOpenApi} from 'zod-openapi'
import {schema} from '@openint/db'
import type {NonEmptyArray} from './connectorSchemas'
import {connectorSchemas, zConnector} from './connectorSchemas'

extendZodWithOpenApi(z)

const event = createSelectSchema(schema.event).openapi({
  ref: 'core.event',
})
const event_insert = createInsertSchema(schema.event).openapi({
  ref: 'core.event_insert',
})

const organization = createSelectSchema(schema.organization).openapi({
  ref: 'core.organization',
})

export function parseNonEmpty<T>(arr: T[]) {
  if (arr.length === 0) {
    throw new Error('Array is empty')
  }
  return arr as NonEmptyArray<T>
}

const coreBase = z.object({
  id: z.string(),
  updated_at: z.string(), // .datetime(), // TODO: Ensure date time format is respected
  created_at: z.string(), // .datetime(), // TODO: Ensure date time format is respected
})

export const core = {
  event,
  event_insert,
  organization,
  connection: z
    .intersection(
      coreBase
        .extend({
          // We have some older connections that don't have a connector_config_id
          // and only connector_name, assuming pure default connector_config_id
          connector_config_id: z.string().nullable(),
          customer_id: z.string(),
          integration_id: z.string().nullable(),
          metadata: z.record(z.string(), z.any()).nullable(),
        })
        .describe('Connection Base'),
      z
        .discriminatedUnion(
          'connector_name',
          parseNonEmpty(
            connectorSchemas.connectionSettings.map((s) =>
              z
                .object({
                  connector_name: s.shape.connector_name,
                  settings: s.shape.connectionSettings,
                })
                .openapi({
                  ref: `connectors.${s.shape.connector_name.value}.connectionSettings`,
                }),
            ),
          ),
        )
        .describe('Connector specific data'),
    )
    .openapi({ref: 'core.connection', title: 'Connection'}),

  connector_config: z
    .intersection(
      coreBase
        .extend({
          org_id: z.string(),
          display_name: z.string().nullable(),
          disabled: z.boolean().nullable(),
        })
        .describe('Connector Config Base'),
      z
        .discriminatedUnion(
          'connector_name',
          parseNonEmpty(
            connectorSchemas.connectorConfig.map((s) =>
              z
                .object({
                  connector_name: s.shape.connector_name,
                  config: s.shape.connectorConfig,
                })
                .openapi({
                  ref: `connectors.${s.shape.connector_name.value}.connectorConfig`,
                }),
            ),
          ),
        )
        .describe('Connector specific data'),
    )
    .openapi({
      ref: 'core.connector_config',
      title: 'Connector Config',
    }),
  connector: zConnector.openapi({ref: 'core.connector', title: 'Connector'}),
  integration: z
    .object({
      connector_name: z.string(),
      name: z.string(),
      logo_url: z.string().nullable(),
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
  [k in keyof typeof core]: z.infer<(typeof core)[k]>
}

// MARK: - Connector Configs

type ConnectorConfigExtended = {
  connector: Core['connector']
  integrations: Record<string, Core['integration']>
  connection_count: number
}

export type ConnectorConfig<
  T extends keyof ConnectorConfigExtended = keyof ConnectorConfigExtended,
> = Core['connector_config'] & Partial<Pick<ConnectorConfigExtended, T>>

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
export type Event = Core['event']

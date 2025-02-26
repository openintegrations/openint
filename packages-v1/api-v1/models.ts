import {z} from 'zod'
import {extendZodWithOpenApi} from 'zod-openapi'
import type {NonEmptyArray} from './connectorSchemas'
import {connectorSchemas} from './connectorSchemas'

extendZodWithOpenApi(z)

function parseNonEmpty<T>(arr: T[]) {
  if (arr.length === 0) {
    throw new Error('Array is empty')
  }
  return arr as NonEmptyArray<T>
}

const coreBase = z.object({
  id: z.string(),
  updated_at: z.string().datetime(),
  created_at: z.string().datetime(),
})

export const core = {
  connection: z
    .intersection(
      coreBase
        .extend({
          connector_config_id: z.string(),
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
}

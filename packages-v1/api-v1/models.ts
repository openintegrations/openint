import {z} from 'zod'
import {extendZodWithOpenApi} from 'zod-openapi'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorSchemas} from '@openint/cdk'

extendZodWithOpenApi(z)

// Maybe this belongs in the all-connectors package?
type NonEmptyArray<T> = [T, ...T[]]

function parseNonEmpty<T>(arr: T[]) {
  if (arr.length === 0) {
    throw new Error('Array is empty')
  }
  return arr as NonEmptyArray<T>
}

const schemaKeys = [
  'connectorConfig',
  'connectionSettings',
  'integrationData',
  'webhookInput',
  'preConnectInput',
  'connectInput',
  'connectOutput',
] as const

const validNames = ['plaid', 'greenhouse'] as const

const connectorSchemas = Object.fromEntries(
  schemaKeys.map((key) => [
    key,
    Object.entries(defConnectors)
      .filter(([name]) =>
        validNames.includes(name as (typeof validNames)[number]),
      )
      .map(([name, def]) => {
        const schemas = def.schemas as ConnectorSchemas
        return z.object({
          connector_name: z.literal(name),
          [key]:
          // Have to do this due to zod version mismatch
          // Also declaring .openapi on mismatched zod does not work due to
          // differing registration holders in zod-openapi
            (schemas[key] as unknown as z.ZodTypeAny | undefined) ?? z.null(),
        })
      }),
  ]),
) as {
  [Key in (typeof schemaKeys)[number]]: NonEmptyArray<
    z.ZodObject<
      {connector_name: z.ZodLiteral<string>} & {[k in Key]: z.ZodTypeAny}
    >
  >
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

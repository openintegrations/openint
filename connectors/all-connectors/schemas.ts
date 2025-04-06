import type {ConnectorSchemas} from '@openint/cdk'
import {nonEmpty} from '@openint/util/array-utils'
import {zodToOas31Schema} from '@openint/util/schema'
import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import {z, zCast} from '@openint/util/zod-utils'
import {defConnectors} from './connectors.def'
import meta from './meta'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type JSONSchema = {}

export const zJSONSchema = zCast<JSONSchema>()

export const zConnectorName = z
  .enum(Object.keys(meta) as [keyof typeof meta])
  .openapi({ref: 'core.connector.name'})

export type ConnectorName = Z.infer<typeof zConnectorName>

// Dedupe this with `ConnectorSchemas` type would be nice
const camelCaseSchemaKeys = [
  'connectorConfig',
  'connectionSettings',
  'integrationData',
  'webhookInput',
  'preConnectInput',
  'connectInput',
  'connectOutput',
] as const

type CamelCaseSchemaKey = (typeof camelCaseSchemaKeys)[number]

/** TODO: Remove this abstraction by refactoring ConnectorDef itself to use snake_case keys */
const schemaKeyFromCamelCase = {
  connectorConfig: 'connector_config',
  connectionSettings: 'connection_settings',
  integrationData: 'integration_data',
  webhookInput: 'webhook_input',
  preConnectInput: 'pre_connect_input',
  connectInput: 'connect_input',
  connectOutput: 'connect_output',
} as const satisfies Record<CamelCaseSchemaKey, string>

export type SchemaKey = (typeof schemaKeyFromCamelCase)[CamelCaseSchemaKey]

export const zConnectorSchemas = z.record(
  z.enum(Object.values(schemaKeyFromCamelCase) as [SchemaKey]),
  zJSONSchema,
)

// Maybe this belongs in the all-connectors package?
/* schemaKey -> Array<{$schemaKey: schema}>  */
export const connectorSchemas = Object.fromEntries(
  camelCaseSchemaKeys.map((key) => [
    key,
    Object.entries(defConnectors).map(([name, def]) => {
      const schemas = def.schemas as ConnectorSchemas
      return z.object({
        connector_name: z.literal(name),
        [key]:
        // Have to do this due to zod version mismatch
        // Also declaring .openapi on mismatched zod does not work due to
        // differing registration holders in zod-openapi
          (schemas[key] as unknown as Z.ZodTypeAny | undefined) ??
          // null does not work because jsonb fields in the DB are not nullable
          // z.union([z.null(), z.object({}).strict()]),
          z.object({}).strict(),
      })
    }),
  ]),
) as {
  [Key in CamelCaseSchemaKey]: NonEmptyArray<
    Z.ZodObject<
      {connector_name: Z.ZodLiteral<string>} & {
        [k in Key]: Z.ZodTypeAny
      }
    >
  >
}

export const zDiscriminatedSettings = z
  .discriminatedUnion(
    'connector_name',
    nonEmpty(
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
  .describe('Connector specific data')

export const zDiscriminatedConfig = z
  .discriminatedUnion(
    'connector_name',
    nonEmpty(
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
  .describe('Connector specific data')

export function jsonSchemasForConnectorSchemas(schemas: ConnectorSchemas) {
  return Object.fromEntries(
    Object.entries(schemas)
      .filter(([k]) => camelCaseSchemaKeys.includes(k as CamelCaseSchemaKey))
      .map(([schemaKey, schema]) => {
        try {
          return [
            schemaKeyFromCamelCase[schemaKey as CamelCaseSchemaKey],
            schema instanceof z.ZodSchema
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                zodToOas31Schema(schema)
              : undefined,
          ]
        } catch (err) {
          throw new Error(
            `Failed to convert schema for ${schemaKey.toString()}: ${err}`,
          )
        }
      }),
  ) as Record<SchemaKey, JSONSchema>
}

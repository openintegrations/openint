import type {ConnectorSchemas} from '@openint/cdk'
import {nonEmpty} from '@openint/util/array-utils'
import {zodToOas31Schema} from '@openint/util/schema'
import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import {z, zCast} from '@openint/util/zod-utils'
import {defConnectors} from './connectors.def'
import type {ConnectorName} from './name'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type JSONSchema = {}

export const zJSONSchema = zCast<JSONSchema>()

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
export const connectorSchemasByKey = Object.fromEntries(
  camelCaseSchemaKeys.map((camelKey) => {
    const schemaKey = schemaKeyFromCamelCase[camelKey]
    return [
      schemaKey,
      z.discriminatedUnion(
        'connector_name',
        nonEmpty(
          Object.entries(defConnectors).map(([name, def]) => {
            // Consider adding a materializeSchemas function that would compute this on a per-connector basis
            // to make it easier to work with indivdiually
            // Would help in connect.ts postConnect
            // Can work together with the new cnext clean up
            const schemas = def.schemas as ConnectorSchemas
            let schema = schemas[camelKey]

            // if connect output is missing, it is assumed that the useConnectHook
            // will return the connection settings as its output
            if (!schema && schemaKey === 'connect_output') {
              schema = schemas.connectionSettings
            }

            if (!schema) {
              // null does not work because jsonb fields in the DB are not nullable
              // z.union([z.null(), z.object({}).strict()]),
              schema = z.object({}).strict()
            }
            return z
              .object({connector_name: z.literal(name), [schemaKey]: schema})
              .openapi({ref: `connector.${name}.discriminated_${schemaKey}`})
          }),
        ),
      ),
    ]
  }),
) as {
  [Key in SchemaKey]: Z.ZodDiscriminatedUnion<
    'connector_name',
    // can we discriminate this to get the actual zod type? We probably could!
    NonEmptyArray<
      Z.ZodObject<
        {connector_name: Z.ZodLiteral<string>} & {[k in Key]: Z.ZodTypeAny}
      >
    >
  >
}

/** Workaround for fact that connection.settings instead of connection.connection_settings */
export const zDiscriminatedSettings = z
  .discriminatedUnion(
    'connector_name',
    nonEmpty(
      connectorSchemasByKey.connection_settings.options.map((s) =>
        z
          .object({
            connector_name: s.shape.connector_name,
            settings: s.shape.connection_settings,
          })
          .openapi({
            ref: `connector.${s.shape.connector_name.value}.discriminated_connection_settings`,
          }),
      ),
    ),
  )
  .describe('Connector specific data')

/** Workaround for fact that connector_config.config instead of connector_config.connector_config */
export const zDiscriminatedConfig = z
  .discriminatedUnion(
    'connector_name',
    nonEmpty(
      connectorSchemasByKey.connector_config.options.map((s) =>
        z
          .object({
            connector_name: s.shape.connector_name,
            config: s.shape.connector_config,
          })
          .openapi({
            ref: `connector.${s.shape.connector_name.value}.discriminated_connector_config`,
          }),
      ),
    ),
  )
  .describe('Connector specific data')

// MARK: - JSON schemas

function jsonSchemasForConnectorSchemas(schemas: ConnectorSchemas) {
  return Object.fromEntries(
    Object.entries(schemas)
      .filter(([k]) => camelCaseSchemaKeys.includes(k as CamelCaseSchemaKey))
      .map(([schemaKey, schema]) => {
        try {
          return [
            schemaKeyFromCamelCase[schemaKey as CamelCaseSchemaKey],
            schema instanceof z.ZodSchema
              ? zodToOas31Schema(schema)
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

/**
 * TODO: pre-compute this and store it in the connectors.meta.ts file.
 * to further reduce the amount of work we need to do at runtime.
 * Though it'd increase size of codebase
 */
export const jsonSchemasByConnectorName = Object.fromEntries(
  Object.entries(defConnectors).map(([name, def]) => [
    name,
    jsonSchemasForConnectorSchemas(def.schemas),
  ]),
) as Record<ConnectorName, Record<SchemaKey, JSONSchema>>

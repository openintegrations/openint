import type {JSONSchema, SchemaKey} from '@openint/cdk'
import type {NonEmptyArray} from '@openint/util/type-utils'
import type {Z} from '@openint/util/zod-utils'
import type {ConnectorName} from './name'

import {
  jsonSchemasFromMaterializedSchemas,
  materializeSchemas,
  schemaKeys,
} from '@openint/cdk'
import {nonEmpty} from '@openint/util/array-utils'
import {z} from '@openint/util/zod-utils'
import {defConnectors} from './connectors.def'

export const schemasByConnectorName = Object.fromEntries(
  Object.entries(defConnectors).map(([name, def]) => [
    name,
    materializeSchemas(def.schemas) as Record<SchemaKey, Z.ZodTypeAny>,
  ]),
) as Record<ConnectorName, Record<SchemaKey, Z.ZodTypeAny>>

/**
 * TODO: pre-compute this and store it in the connectors.meta.ts file.
 * to further reduce the amount of work we need to do at runtime.
 * Though it'd increase size of codebase
 */
export const jsonSchemasByConnectorName = Object.fromEntries(
  Object.entries(schemasByConnectorName).map(([name, schemas]) => [
    name,
    jsonSchemasFromMaterializedSchemas(schemas),
  ]),
) as Record<ConnectorName, Record<SchemaKey, JSONSchema>>

export const discriminatedUnionBySchemaKey = Object.fromEntries(
  schemaKeys.map((schemaKey) => [
    schemaKey,
    z.discriminatedUnion(
      'connector_name',
      nonEmpty(
        Object.entries(schemasByConnectorName).map(([name, schemas]) =>
          z
            .object({
              connector_name: z.literal(name),
              [schemaKey]: schemas[schemaKey],
            })
            .openapi({ref: `connector.${name}.discriminated_${schemaKey}`}),
        ),
      ),
    ),
  ]),
) as {
  [Key in SchemaKey]: Z.ZodDiscriminatedUnion<
    'connector_name',
    NonEmptyArray<
      Z.ZodObject<
        // Technicaly we could make both key and value more specifically typed, but it'd be a pain to use
        {connector_name: Z.ZodLiteral<string /* ConnectorName */>} & {
          [k in Key]: Z.ZodTypeAny
        }
      >
    >
  >
}

/** Workaround for fact that connection.settings instead of connection.connection_settings */
export const zDiscriminatedSettings = z
  .discriminatedUnion(
    'connector_name',
    nonEmpty(
      discriminatedUnionBySchemaKey.connection_settings.options.map((s) =>
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
      discriminatedUnionBySchemaKey.connector_config.options.map((s) =>
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

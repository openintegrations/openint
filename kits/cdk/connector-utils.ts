import {zodToOas31Schema} from '@openint/util/schema'
import type {Invert, NonEmptyArray} from '@openint/util/type-utils'
import {Z, z, zCast} from '@openint/util/zod-utils'
import type {ConnectorSchemas} from './connector.types'

export const _zOauthConfig = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
})

export const zCcfgAuth = {
  oauth: z.object({oauth: _zOauthConfig}),
  oauthOrApikeyAuth: z.object({
    oauth: z
      .union([
        z.null().describe('No oauth'),
        _zOauthConfig.describe('Configure oauth'),
      ])
      .optional()
      .describe('Oauth support'),
    apikeyAuth: z.boolean().optional().describe('API key auth support'),
  }),
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type JSONSchema = {}

export const zJSONSchema = zCast<JSONSchema>()

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

type BackToCamelCase<K extends SchemaKey> = Invert<
  typeof schemaKeyFromCamelCase
>[K]

export const schemaKeys = Object.values(
  schemaKeyFromCamelCase,
) as NonEmptyArray<SchemaKey>

export const zConnectorSchemas = z.record(z.enum(schemaKeys), zJSONSchema)

export function materializeSchemas<T extends ConnectorSchemas>(schemas: T) {
  return Object.fromEntries(
    camelCaseSchemaKeys.map((camelKey) => {
      const schemaKey = schemaKeyFromCamelCase[camelKey]
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

      return [schemaKey, schema]
    }),
  ) as {
    // TODO: Use mapObject from util/object-utils to simplify this typing...
    [Key in SchemaKey]: T[BackToCamelCase<Key>] extends Z.ZodTypeAny
      ? T[BackToCamelCase<Key>]
      : BackToCamelCase<Key> extends 'connectOutput'
        ? T['connectionSettings'] extends Z.ZodTypeAny
          ? T['connectionSettings']
          : Z.ZodObject<{}, 'strict'>
        : Z.ZodObject<{}, 'strict'>
  }
}

/** Accepts snake_case schemas */
export function jsonSchemasFromMaterializedSchemas<
  T extends Record<SchemaKey, Z.ZodTypeAny>,
>(schemas: T) {
  return Object.fromEntries(
    Object.entries(schemas)
      .filter(([k]) =>
        Object.values(schemaKeyFromCamelCase).includes(k as never),
      )
      .map(([schemaKey, schema]) => {
        try {
          return [
            schemaKey,
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
  ) as {[Key in keyof T]: JSONSchema}
}

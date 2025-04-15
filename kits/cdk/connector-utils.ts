import type {Z} from '@openint/util/zod-utils'
import type {ConnectorSchemas} from './connector.types'

import {zodToOas31Schema} from '@openint/util/schema'
import {z, zCast} from '@openint/util/zod-utils'

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

/**  ReturnType<typeof zodToOas31Schema> | JSONSchema7Definition */
export type JSONSchema = {}

export const zJSONSchema = zCast<JSONSchema>()
// Exclude name key
export const schemaKeys = [
  'connector_config',
  'connection_settings',
  'integration_data',
  'webhook_input',
  'pre_connect_input',
  'connect_input',
  'connect_output',
] as const satisfies Array<keyof ConnectorSchemas>

export type SchemaKey = (typeof schemaKeys)[number]

export const zConnectorSchemas = z.record(z.enum(schemaKeys), zJSONSchema)

export function materializeSchemas<T extends ConnectorSchemas>(schemas: T) {
  return Object.fromEntries(
    schemaKeys.map((schemaKey) => {
      let schema = schemas[schemaKey]

      // if connect output is missing, it is assumed that the useConnectHook
      // will return the connection settings as its output
      if (!schema && schemaKey === 'connect_output') {
        schema = schemas.connection_settings
      }

      if (!schema) {
        // null does not work because jsonb fields in the DB are not nullable
        // z.union([z.null(), z.object({}).strict()]),
        schema = z.object({}).strict()
      }

      return [schemaKey, schema]
    }),
  ) as {
    [Key in SchemaKey]: T[Key] extends Z.ZodTypeAny
      ? T[Key]
      : Key extends 'connectOutput'
        ? T['connection_settings'] extends Z.ZodTypeAny
          ? T['connection_settings']
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
      .filter(([k]) => schemaKeys.includes(k as SchemaKey))
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

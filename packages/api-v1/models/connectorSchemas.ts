import {z} from 'zod'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import type {ConnectorDef, ConnectorSchemas} from '@openint/cdk'
// import {z} from '@opensdks/util-zod'
import {titleCase, urlFromImage, zodToOas31Schema} from '@openint/util'

export type NonEmptyArray<T> = [T, ...T[]]

// Dedupe this with `ConnectorSchemas` type would be nice
export const schemaKeys = [
  'connectorConfig',
  'connectionSettings',
  'integrationData',
  'webhookInput',
  'preConnectInput',
  'connectInput',
  'connectOutput',
] as const

type SchemaKey = (typeof schemaKeys)[number]

/** TODO: Remove this abstraction by refactoring ConnectorDef itself to use snake_case keys */
export const schemaKeyToSnakeCase = {
  connectorConfig: 'connector_config',
  connectionSettings: 'connection_settings',
  integrationData: 'integration_data',
  webhookInput: 'webhook_input',
  preConnectInput: 'pre_connect_input',
  connectInput: 'connect_input',
  connectOutput: 'connect_output',
} as const satisfies Record<SchemaKey, string>

type SchemaKeySnakecased = (typeof schemaKeyToSnakeCase)[SchemaKey]

// Maybe this belongs in the all-connectors package?
/* schemaKey -> Array<{$schemaKey: schema}>  */
export const connectorSchemas = Object.fromEntries(
  schemaKeys.map((key) => [
    key,
    Object.entries(defConnectors).map(([name, def]) => {
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
  [Key in SchemaKey]: NonEmptyArray<
    z.ZodObject<
      {connector_name: z.ZodLiteral<string>} & {
        [k in Key]: z.ZodTypeAny
      }
    >
  >
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type JSONSchema = {}

/** Copied for now since not sure if zod versions are comptabiel */
const zCast = <T>(...args: Parameters<(typeof z)['unknown']>) =>
  z.unknown(...args) as z.ZodType<T, z.ZodTypeDef, unknown>

export const zJSONSchema = zCast<JSONSchema>()

export const zConnector = z.object({
  name: z.string(),
  display_name: z.string().optional(),
  logo_url: z.string().optional(),
  stage: z.enum(['alpha', 'beta', 'ga']).optional(),
  platforms: z
    // TODO: Fix me to be the right ones
    .array(z.enum(['web', 'mobile', 'desktop', 'local', 'cloud']))
    .optional(),
  schemas: z
    .record(
      z.enum(Object.values(schemaKeyToSnakeCase) as [SchemaKeySnakecased]),
      zJSONSchema,
    )
    .optional(),
})

export const getConnectorModel = (
  def: ConnectorDef,
  opts: {includeSchemas?: boolean} = {},
): z.infer<typeof zConnector> => ({
  name: def.name,
  display_name: def.metadata?.displayName ?? titleCase(def.name),
  logo_url: def.metadata?.logoSvg
    ? urlFromImage({type: 'svg', data: def.metadata?.logoSvg})
    : def.metadata?.logoUrl,
  // stage: def.metadata?.stage ?? 'alpha',
  // platforms: def.metadata?.platforms ?? ['cloud', 'local'],
  // verticals: def.metadata?.verticals ?? ['other'],
  // authType: def.metadata?.authType,

  // hasPreConnect: def.preConnect != null,
  // hasUseConnectHook: def.useConnectHook != null,
  // TODO: Maybe nangoProvider be more explicit as a base provider?
  // hasPostConnect: def.postConnect != null || def.metadata?.nangoProvider,
  // nangoProvider: def.metadata?.nangoProvider,
  schemas: opts.includeSchemas
    ? jsonSchemasForConnectorSchemas(def.schemas)
    : undefined,
})

export function jsonSchemasForConnectorSchemas<T extends ConnectorSchemas>(
  schemas: T,
) {
  return Object.fromEntries(
    Object.entries(schemas)
      .filter(([k]) => schemaKeys.includes(k as SchemaKey))
      .map(([schemaKey, schema]) => {
        try {
          return [
            schemaKeyToSnakeCase[schemaKey as SchemaKey],
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
  ) as Record<SchemaKeySnakecased, JSONSchema>
}

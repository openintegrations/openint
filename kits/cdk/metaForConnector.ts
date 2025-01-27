import {z} from '@opensdks/util-zod'
import {R, titleCase, urlFromImage, zodToJsonSchema} from '@openint/util'
import type {AnyConnectorImpl, ConnectorSchemas} from './connector.types'

export type JSONSchema = {} // ReturnType<typeof zodToJsonSchema> | JSONSchema7Definition
export const metaForConnector = (
  connector: AnyConnectorImpl,
  opts: {includeOas?: boolean} = {},
) => ({
  // ...connector,
  __typename: 'connector' as const,
  name: connector.name,
  display_name: connector.metadata?.displayName ?? titleCase(connector.name),
  logo_url: connector.metadata?.logoSvg
    ? urlFromImage({type: 'svg', data: connector.metadata?.logoSvg})
    : connector.metadata?.logoUrl,
  stage: connector.metadata?.stage ?? 'alpha',
  platforms: connector.metadata?.platforms ?? ['cloud', 'local'],
  verticals: connector.metadata?.verticals ?? ['other'],
  source_streams: Object.keys(connector.schemas.sourceOutputEntities ?? {}),
  supported_modes: R.compact([
    connector.sourceSync ? ('source' as const) : null,
    connector.destinationSync ? ('destination' as const) : null,
  ]),
  has_pre_connect: connector.preConnect != null,
  has_use_connect_hook: connector.useConnectHook != null,
  // TODO: Maybe nangoProvider be more explicit as a base provider?
  has_post_connect:
    connector.postConnect != null || connector.metadata?.nangoProvider,
  nango_provider: connector.metadata?.nangoProvider,
  schemas: R.mapValues(connector.schemas ?? {}, (schema, type) => {
    try {
      return schema instanceof z.ZodSchema ? zodToJsonSchema(schema) : undefined
    } catch (err) {
      throw new Error(
        `Failed to convert schema for ${connector.name}.${type}: ${err}`,
      )
    }
  }) as Record<keyof ConnectorSchemas, JSONSchema>,
  openapi_spec: opts.includeOas ? connector.metadata?.openapiSpec : undefined,
})

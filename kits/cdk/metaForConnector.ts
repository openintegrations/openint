import {R} from '@openint/util/remeda'
import {titleCase} from '@openint/util/string-utils'
import {urlFromImage} from '@openint/util/url-utils'
import {zodToJsonSchema} from '@openint/util/zod-jsonschema-utils'
import {z} from '@openint/util/zod-utils'
import type {AnyConnectorImpl, ConnectorSchemas} from './connector.types'

export type JSONSchema = {} // ReturnType<typeof zodToJsonSchema> | JSONSchema7Definition
export const metaForConnector = (
  connector: AnyConnectorImpl,
  opts: {includeOas?: boolean} = {},
) => ({
  // ...connector,
  __typename: 'connector' as const,
  name: connector.name,
  displayName: connector.metadata?.displayName ?? titleCase(connector.name),
  logoUrl: connector.metadata?.logoSvg
    ? urlFromImage({type: 'svg', data: connector.metadata?.logoSvg})
    : connector.metadata?.logoUrl,
  stage: connector.metadata?.stage ?? 'alpha',
  platforms: connector.metadata?.platforms ?? ['cloud', 'local'],
  verticals: connector.metadata?.verticals ?? ['other'],
  hasPreConnect: connector.preConnect != null,
  hasUseConnectHook: connector.useConnectHook != null,
  // TODO: Maybe nangoProvider be more explicit as a base provider?
  hasPostConnect:
    connector.postConnect != null || connector.metadata?.nangoProvider,
  nangoProvider: connector.metadata?.nangoProvider,
  schemas: R.mapValues(connector.schemas ?? {}, (schema, type) => {
    try {
      return schema instanceof z.ZodSchema ? zodToJsonSchema(schema) : undefined
    } catch (err) {
      throw new Error(
        `Failed to convert schema for ${connector.name}.${type}: ${err}`,
      )
    }
  }) as Record<keyof ConnectorSchemas, JSONSchema>,
  openapiSpec: opts.includeOas ? connector.metadata?.openapiSpec : undefined,
  authType: connector.metadata?.authType,
})

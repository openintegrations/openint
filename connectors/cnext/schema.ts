import type {ConnectorDef} from '@openint/cdk'
import {getConnectorDefaultCredentials} from '@openint/env'
import {z} from '@openint/util'
import {
  oauth2Schemas,
  zOAuthConnectionSettings,
  zOauthConnectorConfig,
} from './_defaults/oauth2'
import {JsonConnectorDef} from './def'

/**
 * Generates a connector definition based on the Json simplified connector def.
 * Currently only handles Oauth2 ccfgs and connection settings but in future we can switch and generate
 * depending on the def.auth.type
 * @returns
 */
export function generateConnectorDef<T extends JsonConnectorDef>(def: T) {
  const connectorConfig = () => {
    let schema = zOauthConnectorConfig
    if (['OAUTH2', 'OAUTH2CC'].includes(def.auth.type as string)) {
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connector_config as z.AnyZodObject)?.shape,
      }) as typeof schema
    }

    const defaultCredentialsConfigured = getConnectorDefaultCredentials(
      def.connector_name,
    )

    if (defaultCredentialsConfigured) {
      return z.union([
        z.null().openapi({title: 'Use OpenInt platform credentials'}),
        schema.openapi({title: 'Use my own'}),
      ])
    }

    return schema
  }

  const connectionSettings = () => {
    let schema = zOAuthConnectionSettings
    if (['OAUTH2', 'OAUTH2CC'].includes(def.auth.type as string)) {
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connection_settings as z.AnyZodObject)?.shape,
      }) as typeof schema
    }
    return schema
  }

  return {
    name: def.connector_name as T['connector_name'],
    schemas: {
      name: z.literal(def.connector_name as T['connector_name']),
      ...oauth2Schemas,
      // given that this is a union of z.null and z.object, we need to cast it to any
      // and then in runtime we need to inject the
      connectorConfig: connectorConfig() as any as typeof zOauthConnectorConfig,
      connectionSettings:
        connectionSettings() as any as typeof zOAuthConnectionSettings,
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      logoUrl: `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/_assets/logo-${def.connector_name}.svg`,
      authType: def.auth.type,
    },
  } satisfies ConnectorDef<
    typeof oauth2Schemas & {name: z.ZodLiteral<T['connector_name']>}
  >
}

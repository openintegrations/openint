import type {ConnectorDef} from '@openint/cdk'
import {getConnectorDefaultCredentials} from '@openint/env'
import {z, type Z} from '@openint/util/zod-utils'
import {oauth2Schemas} from '.'
import type {JsonConnectorDef} from '../../def'

/**
 * Generates a connector definition based on the Json simplified connector def.
 * Currently only handles Oauth2 ccfgs and connection settings but in future we can switch and generate
 * depending on the def.auth.type
 */
export function generateOauthConnectorDef<T extends JsonConnectorDef>(def: T) {
  const connectorConfig = () => {
    let schema = oauth2Schemas.connectorConfig
    // if there are any connector config overrides, we need to add them to the schema
    if (Object.keys(def.auth?.connector_config ?? {}).length > 0) {
      // TODO: does this need to do a deep merge of connectorConfig.oauth keys?
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connector_config.shape as Record<string, Z.ZodTypeAny>),
      })
    }

    const defaultCredentialsConfigured = getConnectorDefaultCredentials(
      def.connector_name,
    )

    // if there are default credentials configured, we need to add a choice between using the default credentials and the user's own
    // in future only paid customers will get this option
    if (defaultCredentialsConfigured) {
      // Only use default_scopes if they exist, otherwise use an empty array
      const openintDefaultCredentialsScopes =
        def.auth.type === 'OAUTH2' ? (def.auth.openint_scopes ?? []) : []
      const zOpenIntDefaultScopes = z.array(
        z.enum(openintDefaultCredentialsScopes as [string, ...string[]]),
      )
      return z.object({
        // nest under oauth to keep the schema the same as with previous provider
        oauth: z.union([
          z
            .object({
              scopes: zOpenIntDefaultScopes.openapi({
                title: 'Scopes',
                description: 'Scopes for OpenInt Platform Credentials',
              }),
            })
            .openapi({title: 'Use OpenInt platform credentials'}),
          schema.shape.oauth.openapi({title: 'Use my own'}),
        ]),
      })
    }
    return z.object({
      oauth: schema.shape.oauth,
    })
  }

  const connectionSettings = () => {
    let schema = oauth2Schemas.connectionSettings
    if (def.auth.connection_settings) {
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connection_settings.shape as Record<string, Z.ZodTypeAny>),
      })
    }
    return schema
  }

  return {
    name: def.connector_name as T['connector_name'],
    schemas: {
      ...oauth2Schemas,
      name: z.literal(def.connector_name as T['connector_name']),
      connectorConfig: connectorConfig() as any,
      connectionSettings: connectionSettings() as any,
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      logoUrl: `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/_assets/logo-${def.connector_name}.svg`,
      authType: def.auth.type,
      jsonDef: def,
    },
  } satisfies ConnectorDef<
    typeof oauth2Schemas & {name: Z.ZodLiteral<T['connector_name']>}
  >
}

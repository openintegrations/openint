import type {ConnectorDef} from '@openint/cdk'
import {getConnectorDefaultCredentials} from '@openint/env'
import {z} from '@openint/util'
import {oauth2Schemas} from '.'
import {JsonConnectorDef} from '../../def'

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
        ...(def.auth.connector_config as Record<string, z.ZodTypeAny>),
      })
    }

    const defaultCredentialsConfigured = getConnectorDefaultCredentials(
      def.connector_name,
    )

    // if there are default credentials configured, we need to add a choice between using the default credentials and the user's own
    // in future only paid customers will get this option
    if (defaultCredentialsConfigured) {
      return z.object({
        // nest under oauth to keep the schema the same as with previous provider
        oauth: z.union([
          z.null().openapi({title: 'Use OpenInt platform credentials'}),
          schema.openapi({title: 'Use my own'}),
        ]),
      })
    }
    return z.object({
      oauth: schema,
    })
  }

  const connectionSettings = () => {
    return z.object({
      oauth: z.object({
        credentials: def.auth.connection_settings
          ? z.any().parse(def.auth.connection_settings)
          : // note: this needs to extend the schema of the json connector
            // we need to do this in a way that works for oauth
            z.object({}),
      }),
      metadata: z.record(z.unknown()).optional(),
    })
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
    },
  } satisfies ConnectorDef<
    typeof oauth2Schemas & {name: z.ZodLiteral<T['connector_name']>}
  >
}

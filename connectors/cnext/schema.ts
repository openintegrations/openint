import type {ConnectorDef} from '@openint/cdk'
import {z} from '@openint/util'
import {zOauthConnectorConfig} from './_defaults/oauth2'
import {JsonConnectorDef} from './def'

export function generateConnectorDef<T extends JsonConnectorDef>(def: T) {
  const connectorConfig = () => {
    let schema = zOauthConnectorConfig
    if (['OAUTH1', 'OAUTH2'].includes(def.auth.type)) {
      // QQ: is this the right way to do this?
      // this needs to extend the schema of the json connector
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connector_config as Record<string, z.ZodTypeAny>),
      })
    }

    return z.union([
      z.null().openapi({title: 'Use OpenInt platform credentials'}),
      schema.openapi({title: 'Use my own'}),
    ])
  }

  return {
    name: def.connector_name as T['connector_name'],
    schemas: {
      name: z.literal(def.connector_name as T['connector_name']),
      connectorConfig: connectorConfig(),
      connectionSettings:
        // TODO: consider generalizing this
        ['OAUTH1', 'OAUTH2', 'OAUTH2CC'].includes(def.auth.type)
          ? z.object({
              oauth: z.object({
                credentials: def.auth.connection_settings
                  ? z.any().parse(def.auth.connection_settings)
                  : // note: this needs to extend the schema of the json connector
                    // we need to do this in a way that works for oauth
                    z.object({}),
              }),
              metadata: z.record(z.unknown()).optional(),
            })
          : def.auth.connection_settings &&
              Object.keys(def.auth.connection_settings).length > 0
            ? z.any().parse(def.auth.connection_settings)
            : undefined,
      // TODO: review these 3
      preConnectInput: z.object({
        scopes: z.array(z.string()).optional(),
      }),
      connectInput: z.object({
        // important for oauth2 but we may need a more generic way to handle this
        authorization_url: z.string(),
      }),
      connectOutput: z.object({
        code: z.string(),
        connectionId: z.string(),
      }),
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      // TODO: Make this dynamic
      logoUrl: `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/_assets/logo-google-drive.svg`,
      authType: def.auth.type,
    },
  } satisfies ConnectorDef
}

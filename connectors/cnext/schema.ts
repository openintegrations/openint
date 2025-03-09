import {z} from '@openint/util'
import type {ConnectorDef as LegacyConnectorDef} from '../../kits/cdk'
import type {ConnectorDef} from './def'
import {zConnectorConfig} from './def'

export function generateConnectorDef(def: ConnectorDef): LegacyConnectorDef {
  const connectorConfig = () => {
    if (['OAUTH1', 'OAUTH2'].includes(def.auth_type)) {
      return z
        .object(zConnectorConfig.shape)
        .merge(z.object(def.connector_config))
    }

    return def.connector_config
  }

  return {
    name: def.connector_name,
    schemas: {
      name: z.literal(def.connector_name),
      connectorConfig: connectorConfig(),
      connectionSettings:
        // TODO: consider generalizing this
        ['OAUTH1', 'OAUTH2', 'OAUTH2CC'].includes(def.auth_type)
          ? z.object({
              oauth: z.object({
                credentials: def.connection_settings
                  ? z.any().parse(def.connection_settings)
                  : z.object({}),
              }),
              metadata: z.record(z.unknown()).optional(),
            })
          : def.connection_settings &&
              Object.keys(def.connection_settings).length > 0
            ? z.any().parse(def.connection_settings)
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
      stage: def.readiness,
      verticals: def.verticals,
      // TODO: Make this dynamic
      logoUrl: `https://cdn.jsdelivr.net/gh/openintegrations/openint@main/apps/web/public/_assets/logo-google-drive.svg`,
      authType: def.auth_type,
    },
  }
}

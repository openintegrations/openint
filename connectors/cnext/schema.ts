import {z} from '@openint/util'
import {ConnectorDef as LegacyConnectorDef} from '../../kits/cdk'
import {ConnectorDef, zConnectorConfig} from './def'

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
        def.connection_settings &&
        Object.keys(def.connection_settings).length > 0
          ? z.any().parse(def.connection_settings)
          : undefined,
      // TODO: review these 3
      preConnectInput: z.object({
        scopes: z.array(z.string()).optional(),
      }),
      connectInput: z.object({
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

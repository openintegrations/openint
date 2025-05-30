import type {Z} from '@openint/util/zod-utils'
import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'
import {apiKeySchemas} from './schemas'

export function createApiKeyConnectorDef<
  N extends string,
  T extends JsonConnectorDef,
>(name: N, def: T) {
  const connectorConfig = () => {
    let schema = apiKeySchemas.connector_config
    if (Object.keys(def.auth?.connector_config ?? {}).length > 0) {
      // TODO: test this merge with other api key connectors
      schema = z.object({
        ...schema.shape,
        ...(def.auth.connector_config.shape as Record<string, Z.ZodTypeAny>),
      })
    }

    return z.object({
      ...(def.auth.connector_config?.shape as Record<string, Z.ZodTypeAny>),
    })
  }

  const connectionSettings = () => {
    const schema = apiKeySchemas.connection_settings
    if (def.auth.connection_settings) {
      return z
        .object({
          ...(def.auth.connection_settings.shape as Record<
            string,
            Z.ZodTypeAny
          >),
        })
        .openapi({effectType: 'input'})
    }
    return schema
  }

  return {
    name,
    schemas: {
      ...apiKeySchemas,
      name: z.literal(name),
      connector_config: connectorConfig(),
      connection_settings: connectionSettings(),
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      // TODO: We should get this from the connector def/meta
      logoUrl: `/_assets/logo-${name}.svg`,
      authType: def.auth.type,
      jsonDef: def,
    },
  }
}

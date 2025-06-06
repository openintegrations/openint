import type {ConnectorDef} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'
import {apiKeySchemas} from './schemas'

export function createApiKeyConnectorDef<
  N extends string,
  T extends JsonConnectorDef,
>(name: N, def: T) {
  const connectorConfig = () => {
    let schema = apiKeySchemas.connector_config.unwrap().unwrap()
    if (Object.keys(def.auth?.connector_config ?? {}).length > 0) {
      schema = z.object({
        ...schema.shape,
        ...(def?.auth?.connector_config?.shape as Record<string, Z.ZodTypeAny>),
      })
    }
    return schema
  }

  const connectionSettings = () => {
    const schema = apiKeySchemas.connection_settings
    if (schema) {
      return z
        .object({
          ...schema.shape,
          ...(def.auth.connection_settings?.shape as Record<
            string,
            Z.ZodTypeAny
          >),
        })
        .openapi({effectType: 'input'})
    }
    return z
      .object({
        ...(def.auth.connection_settings?.shape as Record<
          string,
          Z.ZodTypeAny
        >),
      })
      .openapi({effectType: 'input'})
  }

  return {
    name,
    schemas: {
      ...apiKeySchemas,
      name: z.literal(name),
      connector_config: connectorConfig() as any,
      connection_settings: connectionSettings() as any,
    },
    metadata: {
      displayName: def.display_name,
      stage: def.stage,
      verticals: def.verticals,
      // TODO: We should get this from the connector def/meta
      logoUrl: `/_assets/logo-${name}.svg`,
      authType: def?.auth?.type,
      jsonDef: def,
    },
  } satisfies ConnectorDef<typeof apiKeySchemas & {name: Z.ZodLiteral<N>}>
}

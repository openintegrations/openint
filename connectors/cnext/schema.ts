import {z} from '@openint/util'
import {ConnectorSchemas} from '../../kits/cdk'
import {ConnectorDef} from './def'

// NOTE this needs to be injected later and not as a schema
// as otherwise it'll be returned to the client and the default
// openint credentials will be expsed
// function getDefaultConnectorConfig(def: ConnectorDef): z.ZodRawShape {
//   if (
//     def.auth_type === 'OAUTH2' &&
//     process.env[`ccfg_${def.connector_name}__CLIENT_ID`] &&
//     process.env[`ccfg_${def.connector_name}__CLIENT_SECRET`]
//   ) {
//     return {
//       client_id: z.literal(
//         process.env[`ccfg_${def.connector_name}__CLIENT_ID`],
//       ),
//       client_secret: z.literal(
//         process.env[`ccfg_${def.connector_name}__CLIENT_SECRET`],
//       ),
//       scopes: z.array(z.string()).default(def.openint_scopes ?? []),
//     }
//   }

//   return {}
// }
export function generateConnectorDef(def: ConnectorDef): ConnectorSchemas {
  return {
    name: z.literal(def.connector_name),
    connectorConfig: z.object({
      client_id: z.string(),
      client_secret: z.string(),
    }),
    connectionSettings: z.object({
      oauth: z.object({
        access_token: z.string(),
        refresh_token: z.string().optional(),
        expires_at: z.number().optional(),
      }),
      client_id: z.string(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
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
  }
}

import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import type {facebookSchemas} from './def'

export const facebookServer = {
  postConnect: async (connectOutput) => {
    const nango = initNangoSDK({
      headers: {authorization: `Bearer ${process.env['NANGO_SECRET_KEY']}`},
    })
    const nangoConnection = await nango
      .GET('/connection/{connectionId}', {
        params: {
          path: {connectionId: connectOutput.connectionId},
          query: {
            provider_config_key: connectOutput.providerConfigKey,
          },
        },
      })
      .then((r) => r.data as {credentials: {access_token: string}})

    return {
      connectionExternalId: extractId(connectOutput.connectionId)[2],
      settings: {
        oauth: nangoConnection,
      },
      triggerDefaultSync: false,
    }
  },
} satisfies ConnectorServer<typeof facebookSchemas>

export default facebookServer

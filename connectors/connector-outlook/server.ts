import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import type {outlookSchemas} from './def'

export const outlookServer = {
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
      resourceExternalId: extractId(connectOutput.connectionId)[2],
      settings: {
        oauth: nangoConnection,
      },
      triggerDefaultSync: true,
    }
  },
} satisfies ConnectorServer<typeof outlookSchemas>

export default outlookServer

import {initGreenhouseSDK, type greenhouseTypes} from '@opensdks/sdk-greenhouse'
import type {ConnectorServer} from '@openint/cdk'
import {type aircallSchema} from './def'

export type AircallSDK = ReturnType<typeof initGreenhouseSDK>

export type AircallTypes = greenhouseTypes

export type AircallObjectType = AircallTypes['components']['schemas']

export const aircallServer = {
  newInstance: ({settings}) => {
    // Aircall auth requires api_id and api_token
    const aircall = initGreenhouseSDK({
      auth: {
        basic: {
          username: `${settings.apiId}:${settings.apiToken}`,
          password: '',
        },
      },
    })
    return aircall
  },
} satisfies ConnectorServer<
  typeof aircallSchema,
  ReturnType<typeof initGreenhouseSDK>
>

export default aircallServer

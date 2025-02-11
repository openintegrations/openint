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
  checkConnection: async ({settings}) => {
    // Encoding credentials:
    const apiId = settings.apiId
    const apiToken = settings.apiToken
    const encodedCredentials = Buffer.from(`${apiId}:${apiToken}`).toString(
      'base64',
    )

    const headers = {
      Authorization: `Basic ${encodedCredentials}`,
    }

    try {
      const response = await fetch('https://api.aircall.io/v1/ping', {
        method: 'GET',
        headers,
      })

      // Check if the response was successful
      if (!response.ok) {
        console.error(
          `HTTP error! status: ${response.status} - ${response.statusText}`,
        )
      }

      const body = await response.text()
      console.log('Response from Aircall Ping:', body)
    } catch (error) {
      console.error('Error during fetch:', error)
    }

    return {
      connectionExternalId: settings.apiId,
    }
  },
} satisfies ConnectorServer<
  typeof aircallSchema,
  ReturnType<typeof initGreenhouseSDK>
>

export default aircallServer

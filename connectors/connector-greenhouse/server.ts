import type {ConnectorServer} from '@openint/cdk'
import type {greenhouseSchema} from './def'

import {initGreenhouseSDK} from '@opensdks/sdk-greenhouse'

export const greenhouseServer = {
  // sourceSync removed
  checkConnection: async ({settings}) => {
    const greenhouse = initGreenhouseSDK({
      auth: {basic: {username: settings.apiKey}},
    })
    try {
      await greenhouse.GET('/v1/jobs')
      return {status: 'healthy'}
    } catch (err) {
      console.warn('Greenhouse checkConnection error', err)
      return {
        status: 'disconnected',
        status_message: `Failed to connect to Greenhouse: ${err}`,
      }
    }
  },
} satisfies ConnectorServer<typeof greenhouseSchema>

export default greenhouseServer

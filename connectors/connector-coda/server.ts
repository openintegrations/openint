import type {CodaSDK} from '@opensdks/sdk-coda'
import type {ConnectorServer} from '@openint/cdk'
import type {codaSchemas} from './def'

import {initCodaSDK} from '@opensdks/sdk-coda'

export const codaServer = {
  newInstance({settings}) {
    return initCodaSDK({headers: {Authorization: `Bearer ${settings.apiKey}`}})
  },

  async proxy({instance, req}) {
    return instance
      .request(req.method as 'GET', req.url.replace(/.+\/api\/proxy/, ''), {
        headers: req.headers,
        ...(!['GET', 'OPTIONS', 'HEAD'].includes(req.method) && {
          body: await req.blob(), // See if this works... We need to figure out how to do streaming here...
        }),
      })
      .then((r) => r.response.clone())
  },
} satisfies ConnectorServer<typeof codaSchemas, CodaSDK>

export default codaServer

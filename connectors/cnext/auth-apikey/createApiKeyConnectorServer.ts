import type {ConnectorDef, ConnectorServer} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {apiKeySchemas, zApiKeyConfig} from './schemas'

import {getClient} from './utils'

export function createAPIKeyConnectorServer<
  TName extends string,
  T extends typeof apiKeySchemas & {name: Z.ZodLiteral<TName>},
>(
  connectorDef: ConnectorDef<T>,
  oauthConfigTemplate: Z.infer<typeof zApiKeyConfig>,
): ConnectorServer<T, ReturnType<typeof getClient>> {
  if (connectorDef.metadata?.authType !== 'API_KEY') {
    throw new Error('This server can only be used with API Key connectors')
  }

  const baseServer = {
    newInstance: ({config, settings, context}) => {
      return getClient({
        connectorName: connectorDef.name,
        oauthConfigTemplate,
        connectorConfig: config,
        connectionSettings: settings,
        fetch: context.fetch,
        baseURLs: context.baseURLs,
      })
    },

    // TODO: Review why we get a type error here but this param works fine
    //  in the oauth2 connector
    async checkConnection({instance}) {
      const {client} = instance
      try {
        await client.GET('/v1/jobs')
        return {status: 'healthy'}
      } catch (err) {
        console.warn('Greenhouse checkConnection error', err)
        return {
          status: 'disconnected',
          status_message: `Failed to connect to Greenhouse: ${err}`,
        }
      }
    },
  } satisfies ConnectorServer<T, ReturnType<typeof getClient>>

  return baseServer as unknown as ConnectorServer<
    ConnectorDef<T>['schemas'],
    ReturnType<typeof getClient>
  >
}

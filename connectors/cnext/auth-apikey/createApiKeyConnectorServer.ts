import type {ConnectorDef, ConnectorServer} from '@openint/cdk'
import type {Z} from '@openint/util/zod-utils'
import type {apiKeySchemas} from './schemas'

export function createAPIKeyConnectorServer<
  TName extends string,
  T extends typeof apiKeySchemas & {name: Z.ZodLiteral<TName>},
>(connectorDef: ConnectorDef<T>): ConnectorServer<T> {
  if (connectorDef.metadata?.authType !== 'API_KEY') {
    throw new Error('This server can only be used with API Key connectors')
  }

  const baseServer = {
    async checkConnection({settings}) {
      const auth = connectorDef.metadata?.jsonDef?.auth

      if (!auth || auth.type !== 'API_KEY') {
        throw new Error('Invalid connector definition')
      }

      const url = `${auth?.base_url}${auth?.verification.endpoint}`

      const apiKey = settings?.api_key
      if (!apiKey) {
        throw new Error('Credentials are not configured')
      }

      // Handle Basic auth by base64 encoding the API key
      const authHeader =
        auth?.verification.api_key_location === 'header_basic_password'
          ? `Basic ${Buffer.from(`${apiKey}:`).toString('base64').trim()}`
          : `${auth?.verification.api_key_location} ${apiKey}`

      try {
        const response = await fetch(url, {
          method: auth?.verification.method,
          headers: {
            Authorization: authHeader,
          },
        })

        if (!response.ok) {
          const errorText = await response
            .text()
            .catch(() => 'No error details available')
          throw new Error(
            `Connection check failed with status ${response.status} (${response.statusText}): ${errorText}`,
          )
        }

        return {
          status: 'healthy',
          status_message: null,
          settings,
        }
      } catch (error) {
        return {
          status: 'disconnected',
          status_message:
            error instanceof Error ? error.message : String(error),
          settings,
        }
      }
    },
  } satisfies ConnectorServer<typeof apiKeySchemas & {name: T['name']}>

  return baseServer as unknown as ConnectorServer<ConnectorDef<T>['schemas']>
}

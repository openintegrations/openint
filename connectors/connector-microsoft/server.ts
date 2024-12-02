import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import type {microsoftSchemas} from './def'

function mergeScopes(
  globalScopes: string = '',
  integrationScopes: string = '',
): string {
  const scopes = [globalScopes, integrationScopes].filter(Boolean).join(' ')
  return scopes
}

// QQ: Why are these integrations in snake case whereas some like plaid has standard in camel case?
const integrations = [
  {
    id: 'sharepoint',
    name: 'Sharepoint Online',
    // TODO: Differ oauth scope use in Connect based on which integration
    raw_data: {} as any,
    verticals: ['file-storage'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-sharepoint.svg',
  },
]

export const microsoftServer = {
  async preConnect(_, context) {
    // This returns auth options for Nango connect because it is an oauth integration
    // this behavior is not type checked though and could use some improvement
    // May be fixed if we turn nango into a connector

    const globalScopes = _.oauth.scopes

    const integrationScopesMap = integrations.reduce(
      (map, integration) => {
        map[integration.id] =
          _.integrations[integration.id as keyof typeof _.integrations]?.scopes
        return map
      },
      {} as Record<string, string | undefined>,
    )

    if (
      context.integrationExternalId &&
      context.integrationExternalId in integrationScopesMap
    ) {
      const authParams = {
        authorization_params: {
          scope: mergeScopes(
            globalScopes,
            integrationScopesMap[
              context.integrationExternalId as keyof typeof integrationScopesMap
            ],
          ),
        },
      }
      return authParams
    }
    return {}
  },
  async listIntegrations(params: unknown) {
    const integrationsToFilter =
      (params as any)?.ccfg?.config?.integrations ?? {}

    return {
      has_next_page: false,
      items: integrations.filter(
        (int) => integrationsToFilter[int.id]?.enabled === true,
      ) as any,
      next_cursor: null,
    }
  },
  async postConnect(connectOutput, config, context: any) {
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
      .then((r) => r.data)

    const defaultResource = {
      resourceExternalId: extractId(connectOutput.connectionId)[2],
      settings: {oauth: nangoConnection},
    }
    if (!context.integrationId) {
      return defaultResource
    }

    const data = integrations.find((int) =>
      context.integrationId.includes(int.id),
    )

    if (!data) {
      console.warn(
        `[microsoftServer] postConnect: integration not found ${context.integrationId} for config ${config.oauth.client_id}`,
      )
      return defaultResource
    }

    return {
      ...defaultResource,
      integration: {
        // Integration id is scoped to connector, not scoped to resource
        externalId: data.id,
        connectorName: 'microsoft',
        data,
      },
    }
  },
} satisfies ConnectorServer<typeof microsoftSchemas>

export default microsoftServer

import type {MsgraphSDK} from '@opensdks/sdk-msgraph'
import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import type {microsoftSchemas} from './def'

function mergeScopes(
  globalScopes: string = '',
  integrationScopes: string = '',
): string {
  const scopes = [globalScopes, integrationScopes].filter(Boolean).join(' ')
  // Add offline access to the scopes to be able to refresh the token
  const scopesWithOfflineAccess = scopes.split(' ').concat('offline_access')
  // Remove duplicates
  const uniqueScopes = Array.from(new Set(scopesWithOfflineAccess))
  return uniqueScopes.join(' ')
}

const integrations = [
  {
    id: 'sharepoint',
    name: 'Sharepoint',
    raw_data: {} as any,
    verticals: ['file-storage'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-sharepoint.svg',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    raw_data: {} as any,
    verticals: ['email'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-outlook.svg',
  },
  {
    id: 'teams',
    name: 'Teams',
    raw_data: {} as any,
    verticals: ['messaging'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-teams.svg',
  },
]

export const microsoftServer = {
  async preConnect({config, context}) {
    // This returns auth options for Nango connect because it is an oauth integration
    // this behavior is not type checked though and could use some improvement
    // May be fixed if we turn nango into a connector

    const globalScopes = config.oauth.scopes

    const integrationScopesMap = integrations.reduce(
      (map, integration) => {
        map[integration.id] =
          config.integrations[integration.id as keyof typeof config.integrations]?.scopes
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
        // note: doesn't seem to be working
        auth_mode: 'OAUTH2_CC',
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
  async postConnect({connectOutput, config, context}: {
    connectOutput: any
    config: any
    context: any
  }) {
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
      connectionExternalId: extractId(connectOutput.connectionId)[2],
      settings: {oauth: nangoConnection, client_id: config.oauth.client_id},
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
        // Integration id is scoped to connector, not scoped to connection
        externalId: data.id,
        connectorName: 'microsoft',
        data,
      },
    }
  },
} satisfies ConnectorServer<typeof microsoftSchemas, MsgraphSDK>

export default microsoftServer

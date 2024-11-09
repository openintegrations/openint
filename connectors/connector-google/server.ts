import {extractId, type ConnectorServer} from '@openint/cdk'
import type {googleSchemas} from './def'

function mergeScopes(
  globalScopes: string = '',
  integrationScopes: string = '',
): string {
  const scopes = [globalScopes, integrationScopes].filter(Boolean).join(',')
  return scopes
}

// QQ: Why are these integrations in snake case whereas some like plaid has standard in camel case?
const integrations = [
  {
    id: 'drive',
    name: 'Google Drive',
    // TODO: Differ oauth scope use in Connect based on which integration
    raw_data: {} as any,
    verticals: ['file-storage'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-google-drive.svg',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    raw_data: {} as any,
    verticals: ['email'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-google-gmail.svg',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    raw_data: {} as any,
    verticals: ['calendar'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-google-calendar.svg',
  },
]

export const googleServer = {
  // newInstance: ({settings, fetchLinks}) => {
  //   const sdk = initHubspotSDK({
  //     // We rely on nango to refresh the access token...
  //     headers: {
  //       authorization: `Bearer ${settings.oauth.credentials.access_token}`,
  //     },
  //     links: (defaultLinks) => [
  //       (req, next) => {
  //         if (sdk.clientOptions.baseUrl) {
  //           req.headers.set(
  //             nangoProxyLink.kBaseUrlOverride,
  //             sdk.clientOptions.baseUrl,
  //           )
  //         }
  //         return next(req)
  //       },
  //       ...fetchLinks,
  //       ...defaultLinks,
  //     ],
  //   })
  //   return sdk
  // },
  // passthrough: (instance, input) =>
  //   instance.request(input.method, input.path, {
  //     headers: input.headers as Record<string, string>,
  //     params: {query: input.query},
  //     body: JSON.stringify(input.body),
  //   }),
  // eslint-disable-next-line @typescript-eslint/require-await
  async preConnect(_, context) {
    // This returns auth options for Nango connect because it is an oauth integration
    // this behavior is not type checked though and could use some improvement
    // May be fixed if we turn nango into a connector

    const globalScopes = _.oauth.scopes

    if (context.integrationExternalId === 'drive') {
      return {
        authorization_params: {
          scope: mergeScopes(globalScopes, _.integrations.drive?.scopes),
        },
      }
    }
    if (context.integrationExternalId === 'calendar') {
      return {
        authorization_params: {
          scope: mergeScopes(globalScopes, _.integrations.calendar?.scopes),
        },
      }
    }
    if (context.integrationExternalId === 'gmail') {
      return {
        authorization_params: {
          scope: mergeScopes(globalScopes, _.integrations.gmail?.scopes),
          // 	•	https://www.googleapis.com/auth/gmail.send (Send only)
          // TODO: How do we determine more specific scopes here?
        },
      }
    }
    return {}
  },
  async listIntegrations(params: unknown) {
    const integrationsToFilter = (params as any)?.ccfg?.integrations ?? {}

    return {
      has_next_page: false,
      items: integrations.filter(
        (int) => integrationsToFilter[int.id]?.enabled === true,
      ) as any,
      next_cursor: null,
    }
  },
  async postConnect(connectOutput: any, config: any, context: any) {
    const defaultResource = {
      resourceExternalId: extractId(connectOutput.connectionId)[2],
      settings: connectOutput,
    }
    if (!context.integrationId) {
      return defaultResource
    }

    const data = integrations.find((int) =>
      context.integrationId.includes(int.id),
    )

    if (!data) {
      console.warn(
        `[googleServer] postConnect: integration not found ${context.integrationId} for config ${config.oauth.client_id}`,
      )
      return defaultResource
    }

    return {
      ...defaultResource,
      integration: {
        // Integration id is scoped to connector, not scoped to resource
        externalId: data.id,
        connectorName: 'google',
        data,
      },
    }
  },
} satisfies ConnectorServer<typeof googleSchemas>

export default googleServer

import {extractId, initNangoSDK, type ConnectorServer} from '@openint/cdk'
import type {googleSchemas} from './def'

function mergeScopes(
  globalScopes: string = '',
  integrationScopes: string = '',
): string {
  const scopes = [globalScopes, integrationScopes].filter(Boolean).join(' ')
  console.log('[googleServer] scopes', scopes)
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
  {
    id: 'sheets',
    name: 'Google Sheets',
    raw_data: {} as any,
    verticals: ['flat-files-and-spreadsheets'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-spreadsheet.svg',
  },
  {
    id: 'slides',
    name: 'Slides',
    raw_data: {} as any,
    verticals: ['flat-files-and-spreadsheets'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-google-slides.svg',
  },
  {
    id: 'docs',
    name: 'Docs',
    raw_data: {} as any,
    verticals: ['flat-files-and-spreadsheets'],
    updated_at: new Date().toISOString(),
    logo_url: '/_assets/logo-google-docs.svg',
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
      console.log('[googleServer] authParams', authParams)
      return authParams
    }
    console.log('[googleServer] no authParams', JSON.stringify(context))
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
  // note: context currently returns this correctly but types don't catch it
  // "context": {
  //   "integrationId": "int_google_sheets",
  //   "extCustomerId": "cus_1234",
  //   "webhookBaseUrl": "http://localhost:4000/api/trpc/webhook/ccfg_google_01JBYY6NZ551BR7Y9DXMBZ79K4",
  //   "redirectUrl": "http://localhost:4000/"
  // }
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
      connectionExternalId: extractId(connectOutput.connectionId)[2],
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

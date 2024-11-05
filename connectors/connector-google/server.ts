// import type {HubspotSDK} from '@opensdks/sdk-google'
import type {ConnectorServer} from '@openint/cdk'
import type {googleSchemas} from './def'

function mergeScopes(
  globalScopes: string = '',
  integrationScopes: string = '',
): string {
  const scopes = [globalScopes, integrationScopes].filter(Boolean).join(',')
  return scopes
}

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
  // eslint-disable-next-line @typescript-eslint/require-await
  async listIntegrations() {
    return {
      has_next_page: false,
      items: [
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
      ],
      next_cursor: null,
    }
  },
} satisfies ConnectorServer<typeof googleSchemas>

export default googleServer

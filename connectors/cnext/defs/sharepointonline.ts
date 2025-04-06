import type {JsonConnectorDef} from '../def'

export default {
  audience: ['business'],
  connector_name: 'sharepointonline',
  verticals: ['file-storage', 'communication'],
  display_name: 'SharePoint Online (v2)',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token_request_url:
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        response_mode: 'query',
        prompt: 'consent',
      },
      token: {grant_type: 'authorization_code'},
    },
    openint_scopes: ['offline_access'],
    scopes: [
      {
        scope: 'offline_access',
        description:
          'Allows the application to request refresh tokens, which can be used to obtain new access tokens without user interaction. This enables the application to maintain access to resources even when the user is not actively using the application.',
      },
    ],
  },
} satisfies JsonConnectorDef

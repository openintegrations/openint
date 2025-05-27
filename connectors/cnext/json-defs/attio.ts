import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Attio',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.attio.com/authorize',
    token_request_url: 'https://app.attio.com/oauth/token',
    scope_separator: ' ',
    params_config: {token: {grant_type: 'authorization_code'}},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'attio.contacts.read', 'attio.companies.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Allows the application to verify the user's identity and get basic profile information",
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to refresh access tokens when the user is not actively using the application',
      },
      {
        scope: 'attio.contacts.read',
        description: 'Read-only access to contact records in Attio',
      },
      {
        scope: 'attio.contacts.write',
        description: 'Read and write access to contact records in Attio',
      },
      {
        scope: 'attio.companies.read',
        description: 'Read-only access to company records in Attio',
      },
      {
        scope: 'attio.companies.write',
        description: 'Read and write access to company records in Attio',
      },
      {
        scope: 'attio.workspace.settings',
        description: 'Access to workspace settings and configuration',
      },
    ],
  },
} satisfies JsonConnectorDef

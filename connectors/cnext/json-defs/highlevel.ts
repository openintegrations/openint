import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'HighLevel',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://marketplace.gohighlevel.com/oauth/chooselocation',
    token_request_url: 'https://services.leadconnectorhq.com/oauth/token',
    scope_separator: ' ',
    params_config: {token: {grant_type: 'authorization_code'}},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'contacts.readonly', 'calendar'],
    scopes: [
      {
        scope: 'openid',
        description:
          "Mandatory for authentication flows. Allows the application to verify the user's identity and get basic profile information.",
      },
      {
        scope: 'profile',
        description:
          'Provides access to basic user profile information (name, email, etc.).',
      },
      {
        scope: 'contacts.readonly',
        description: 'Read-only access to contact information in HighLevel.',
      },
      {
        scope: 'contacts',
        description: 'Full read/write access to contacts in HighLevel.',
      },
      {
        scope: 'calendar',
        description:
          'Full access to calendar events including creation, modification, and deletion.',
      },
      {
        scope: 'opportunities',
        description:
          'Access to sales opportunities and pipeline management features.',
      },
      {
        scope: 'admin',
        description:
          'Full administrative access to the HighLevel account including account settings and user management.',
      },
    ],
  },
} satisfies JsonConnectorDef

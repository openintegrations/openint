import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['crm'],
  display_name: 'Wealthbox',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.crmworkspace.com/oauth/authorize',
    token_request_url: 'https://app.crmworkspace.com/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'contacts.readonly', 'calendar'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (name, email) for authentication purposes',
      },
      {
        scope: 'offline_access',
        description:
          'Allows the application to obtain refresh tokens for long-term access when user is not actively using the app',
      },
      {
        scope: 'contacts.readonly',
        description:
          'Read-only access to contact information (names, emails, phone numbers) without modification capabilities',
      },
      {
        scope: 'contacts.write',
        description:
          'Read and write access to contact information, allowing creation and modification of contacts',
      },
      {
        scope: 'calendar',
        description:
          'Full access to calendar events including reading, creating, and modifying appointments',
      },
      {
        scope: 'tasks',
        description:
          'Full access to task management including reading, creating, and modifying tasks',
      },
      {
        scope: 'admin',
        description:
          'Administrative access including account settings and user management (highest privilege)',
      },
    ],
  },
} satisfies JsonConnectorDef

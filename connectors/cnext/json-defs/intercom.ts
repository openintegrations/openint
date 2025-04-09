import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Intercom',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.intercom.io/oauth',
    token_request_url: 'https://api.intercom.io/auth/eagle/token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['users.read'],
    scopes: [
      {
        scope: 'read',
        description:
          'Allows read-only access to Intercom data, including users, companies, conversations, and more. Cannot modify any data.',
      },
      {
        scope: 'write',
        description:
          'Allows read and write access to Intercom data. Can create and update users, companies, conversations, etc.',
      },
      {
        scope: 'users.read',
        description:
          'Allows read-only access to user data only. Cannot access companies, conversations, or other data types.',
      },
      {
        scope: 'companies.read',
        description:
          'Allows read-only access to company data only. Cannot access user data or other data types.',
      },
      {
        scope: 'conversations.read',
        description:
          'Allows read-only access to conversations only. Cannot access user or company data.',
      },
      {
        scope: 'contacts.write',
        description:
          'Allows read and write access to contact data only. More limited than full write access.',
      },
      {
        scope: 'admin',
        description:
          'Provides full access to all Intercom data and administrative functions, including account settings.',
      },
    ],
  },
} satisfies JsonConnectorDef

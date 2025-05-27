import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['accounting'],
  display_name: 'FreshBooks',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.freshbooks.com/oauth/authorize',
    token_request_url: 'https://api.freshbooks.com/auth/oauth/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['user'],
    openint_allowed_scopes: ['user', 'user:profile:read', 'client:read'],
    scopes: [
      {
        scope: 'user:profile:read',
        description:
          "Read access to the user's profile information (basic details like name, email, etc.)",
      },
      {
        scope: 'user',
        description:
          'Basic read access to user information and the ability to see which businesses the user has access to',
      },
      {
        scope: 'invoice:read',
        description: 'Read access to invoices and related data',
      },
      {
        scope: 'invoice:write',
        description: 'Create, update, and delete invoices',
      },
      {
        scope: 'client:read',
        description: 'Read access to client information',
      },
      {
        scope: 'client:write',
        description: 'Create, update, and delete client information',
      },
      {
        scope: 'accounting:read',
        description:
          'Read access to accounting data including expenses, payments, and reports',
      },
      {
        scope: 'accounting:write',
        description:
          'Full access to accounting data including creating and updating expenses, payments, etc.',
      },
      {
        scope: 'all',
        description:
          'Full access to all data and operations in the connected business',
      },
    ],
  },
} satisfies JsonConnectorDef

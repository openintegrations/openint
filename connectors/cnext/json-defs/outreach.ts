import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Outreach',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.outreach.io/oauth/authorize',
    token_request_url: 'https://api.outreach.io/oauth/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_scopes: ['read:user'],
    scopes: [
      {
        scope: 'read:user',
        description:
          'Allows read-only access to basic user profile information (name, email, etc.)',
      },
      {
        scope: 'read:prospects',
        description:
          'Provides read access to prospect data including contact information and engagement history',
      },
      {
        scope: 'write:prospects',
        description:
          'Allows creating and updating prospect records in the Outreach platform',
      },
      {
        scope: 'read:sequences',
        description:
          'Grants read access to sequence data including steps and templates',
      },
      {
        scope: 'write:sequences',
        description:
          'Allows creating and modifying email sequences and templates',
      },
      {
        scope: 'admin:all',
        description:
          'Provides full administrative access to all Outreach data and functions',
      },
    ],
  },
} satisfies JsonConnectorDef

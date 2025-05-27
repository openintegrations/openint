import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'ServiceM8',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://go.servicem8.com/oauth/authorize',
    token_request_url: 'https://go.servicem8.com/oauth/access_token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'jobs.read'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows authentication and basic user profile information (like user ID). This is the minimal scope required for authentication flows.',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, etc.) beyond just the openid identifier.',
      },
      {
        scope: 'jobs.read',
        description: 'Read-only access to job information in ServiceM8.',
      },
      {
        scope: 'jobs.write',
        description:
          'Read and write access to job information, including creating and updating jobs.',
      },
      {
        scope: 'contacts.read',
        description: 'Read-only access to contact information in ServiceM8.',
      },
      {
        scope: 'contacts.write',
        description:
          'Read and write access to contact information, including creating and updating contacts.',
      },
      {
        scope: 'admin',
        description:
          'Full administrative access to all account data and settings.',
      },
    ],
  },
} satisfies JsonConnectorDef

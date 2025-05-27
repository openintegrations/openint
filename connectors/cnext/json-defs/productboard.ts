import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Productboard',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.productboard.com/oauth2/authorize',
    token_request_url: 'https://app.productboard.com/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'read:user', 'read:roadmap'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows access to basic user profile information (like user ID) for authentication purposes.',
      },
      {
        scope: 'email',
        description: "Allows access to the user's email address.",
      },
      {
        scope: 'read:user',
        description: 'Allows read-only access to basic user information.',
      },
      {
        scope: 'read:features',
        description:
          'Allows read-only access to product features and their metadata.',
      },
      {
        scope: 'write:features',
        description: 'Allows creating and updating product features.',
      },
      {
        scope: 'read:roadmap',
        description: 'Allows read-only access to roadmap items and timelines.',
      },
      {
        scope: 'write:roadmap',
        description: 'Allows modifying roadmap items and timelines.',
      },
      {
        scope: 'admin:workspace',
        description:
          'Allows full administrative access to the workspace including user management and settings.',
      },
    ],
  },
} satisfies JsonConnectorDef

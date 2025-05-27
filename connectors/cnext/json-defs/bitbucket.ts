import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'Bitbucket',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://bitbucket.org/site/oauth2/authorize',
    token_request_url: 'https://bitbucket.org/site/oauth2/access_token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['account'],
    openint_allowed_scopes: ['account', 'email', 'repository:read'],
    scopes: [
      {
        scope: 'account',
        description:
          'Read your account information including email address and account type',
      },
      {
        scope: 'email',
        description: "Read your account's primary email address",
      },
      {
        scope: 'repository',
        description:
          'Full access to repositories including read and write operations',
      },
      {
        scope: 'repository:read',
        description:
          'Read-only access to repositories (code, pull requests, issues)',
      },
      {
        scope: 'repository:write',
        description:
          'Write access to repositories (code, pull requests, issues)',
      },
      {
        scope: 'repository:admin',
        description:
          'Admin access to repositories (settings, webhooks, deploy keys)',
      },
      {
        scope: 'team',
        description: 'Read team membership information',
      },
      {
        scope: 'webhook',
        description: 'Create and manage webhooks for repositories',
      },
      {
        scope: 'snippet',
        description:
          'Full access to code snippets including read and write operations',
      },
      {
        scope: 'snippet:read',
        description: 'Read-only access to code snippets',
      },
    ],
  },
} satisfies JsonConnectorDef

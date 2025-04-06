import {generateOauthConnectorDef} from '../../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'github',
  verticals: ['developer-tools', 'ticketing'],
  display_name: 'GitHub (User OAuth)',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://github.com/login/oauth/authorize',
    token_request_url: 'https://github.com/login/oauth/access_token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['user:email'],
    scopes: [
      {
        scope: 'user:email',
        description:
          "Grants read-only access to a user's email addresses. This scope only allows viewing the email addresses associated with the user's account, but does not provide access to any other user data or repository information.",
      },
      {
        scope: 'read:user',
        description:
          "Provides access to read a user's profile data. This includes basic information like name, email, and bio, but doesn't include access to private repositories or the ability to modify any data.",
      },
      {
        scope: 'repo',
        description:
          'Grants full access to public and private repositories including the ability to read and write code, commit changes, create issues, and manage repository settings. This is a very broad scope with significant privileges.',
      },
      {
        scope: 'repo:status',
        description:
          "Allows read and write access to public and private repository commit statuses. This is used for CI services to mark commits as passing/failing tests, but doesn't provide access to code or other repository contents.",
      },
      {
        scope: 'admin:org',
        description:
          'Provides full organization and team management access, including the ability to create and delete repositories, manage team membership, and change organization settings. This is a very powerful scope with administrative privileges.',
      },
      {
        scope: 'write:discussion',
        description:
          "Grants permission to read and write team discussions. This allows creating and commenting on team discussions within organizations the user has access to, but doesn't provide access to code or repository settings.",
      },
      {
        scope: 'workflow',
        description:
          "Provides the ability to add and update GitHub Actions workflow files. This scope allows modifying CI/CD pipelines but doesn't grant access to repository code or settings outside of workflows.",
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)

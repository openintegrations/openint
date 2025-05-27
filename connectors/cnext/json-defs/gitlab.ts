import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools', 'ticketing'],
  display_name: 'GitLab',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://gitlab.com/oauth/authorize',
    token_request_url: 'https://gitlab.com/oauth/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['openid', 'read_user'],
    openint_allowed_scopes: ['openid', 'read_user', 'read_repository'],
    scopes: [
      {
        scope: 'read_user',
        description:
          "Allows read-only access to the authenticated user's profile information (e.g., name, email, username). This is the minimal scope required for basic user identification.",
      },
      {
        scope: 'api',
        description:
          'Provides full access to the GitLab API on behalf of the authenticated user, including read and write operations for repositories, issues, merge requests, etc.',
      },
      {
        scope: 'read_api',
        description:
          'Grants read-only access to the GitLab API, allowing the application to fetch data (e.g., repositories, issues, merge requests) but not modify anything.',
      },
      {
        scope: 'read_repository',
        description:
          'Allows read-only access to repository contents (code, commits, branches) but does not permit modifications or access to other user data.',
      },
      {
        scope: 'write_repository',
        description:
          'Grants read and write access to repositories, including pushing code, creating branches, and managing merge requests.',
      },
      {
        scope: 'sudo',
        description:
          'Enables impersonation of any user in the system (admin-level scope). Requires admin privileges and has the broadest access.',
      },
      {
        scope: 'openid',
        description:
          "Used for OpenID Connect authentication, allowing the application to verify the user's identity and fetch basic profile info.",
      },
      {
        scope: 'profile',
        description:
          'Extends read_user to include additional profile details (e.g., avatar, timezone) but does not grant access to repositories or other resources.',
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's primary email address (in addition to basic profile info from read_user).",
      },
    ],
  },
} satisfies JsonConnectorDef

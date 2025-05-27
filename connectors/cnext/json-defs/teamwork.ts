import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Teamwork',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.teamwork.com/launchpad/login',
    token_request_url: 'https://www.teamwork.com/launchpad/v1/token.json',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'profile', 'read:team'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows authentication and provides basic user profile information (like user ID). This is the minimal scope required for most OAuth authorization flows.',
      },
      {
        scope: 'profile',
        description:
          'Access to basic user profile information (name, email, avatar).',
      },
      {
        scope: 'read:team',
        description:
          'Read-only access to team information (members, channels, basic metadata).',
      },
      {
        scope: 'write:team',
        description:
          'Create and modify team resources (channels, user invitations).',
      },
      {
        scope: 'read:messages',
        description:
          'Read messages in channels/conversations the app has access to.',
      },
      {
        scope: 'write:messages',
        description:
          'Send and update messages as the authenticated user or bot.',
      },
      {
        scope: 'admin:team',
        description:
          'Full administrative access to all team resources and settings.',
      },
    ],
  },
} satisfies JsonConnectorDef

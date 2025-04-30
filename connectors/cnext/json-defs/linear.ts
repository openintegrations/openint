import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['ticketing'],
  display_name: 'Linear',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://linear.app/oauth/authorize',
    token_request_url: 'https://api.linear.app/oauth/token',
    scope_separator: ',',
    params_config: {authorize: {prompt: 'consent'}},
    openint_scopes: ['read'],
    scopes: [
      {
        scope: 'read',
        description:
          "(Default) Read access for the user's account. This scope will always be present.",
      },
      {
        scope: 'write',
        description:
          "Write access for the user's account. If your application only needs to create comments, use a more targeted scope.",
      },
      {
        scope: 'issues:create',
        description: 'Allows creating new issues and their attachments.',
      },
      {
        scope: 'comments:create',
        description: 'Allows creating new issue comments.',
      },
      {
        scope: 'timeSchedule:write',
        description: 'Allows creating and modifying time schedules.',
      },
      {
        scope: 'admin',
        description:
          "Full access to admin level endpoints. You should never ask for this permission unless it's absolutely needed.",
      },
    ],
  },
} satisfies JsonConnectorDef

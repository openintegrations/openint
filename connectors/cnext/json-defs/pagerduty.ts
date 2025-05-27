import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['developer-tools'],
  display_name: 'PagerDuty',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://app.pagerduty.com/oauth/authorize',
    token_request_url: 'https://app.pagerduty.com/oauth/token',
    scope_separator: ' ',
    params_config: {},
    openint_default_scopes: ['openid', 'offline_access'],
    openint_allowed_scopes: ['openid', 'offline_access', 'user.read', 'incidents.read', 'services.read'],
    scopes: [
      {
        scope: 'user.read',
        description:
          'Read-only access to user profile information (name, email, contact info)',
      },
      {
        scope: 'openid',
        description:
          'Required for OpenID Connect authentication flows to verify user identity',
      },
      {
        scope: 'offline_access',
        description:
          'Required to obtain refresh tokens for long-lived access when user is not active',
      },
      {
        scope: 'incidents.read',
        description:
          'Read-only access to incident data (status, timestamps, summaries)',
      },
      {
        scope: 'incidents.write',
        description: 'Create, update, and resolve incidents',
      },
      {
        scope: 'services.read',
        description: 'Read access to service configurations and integrations',
      },
      {
        scope: 'teams.read',
        description: 'Read access to team memberships and configurations',
      },
      {
        scope: 'schedules.read',
        description: 'Read access to on-call schedules and overrides',
      },
      {
        scope: 'account.read',
        description: 'Read access to account-level settings and configurations',
      },
      {
        scope: 'full_access',
        description:
          'Full read/write access to all PagerDuty resources (equivalent to admin privileges)',
      },
    ],
  },
} satisfies JsonConnectorDef

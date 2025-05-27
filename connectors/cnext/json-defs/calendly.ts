import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Calendly',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://auth.calendly.com/oauth/authorize',
    token_request_url: 'https://auth.calendly.com/oauth/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_default_scopes: ['openid', 'read:events'],
    openint_allowed_scopes: ['openid', 'profile', 'read:events', 'read:event_types'],
    scopes: [
      {
        scope: 'profile',
        description:
          'Read access to basic user profile information including name, email, and avatar',
      },
      {
        scope: 'email',
        description: "Access to the user's email address",
      },
      {
        scope: 'read:event_types',
        description:
          "Read access to the user's event types and scheduling links",
      },
      {
        scope: 'read:events',
        description: "Read access to the user's scheduled events",
      },
      {
        scope: 'read:invitees',
        description: 'Read access to information about event invitees',
      },
      {
        scope: 'write:event_types',
        description: "Create and update access to the user's event types",
      },
      {
        scope: 'write:events',
        description: "Create and update access to the user's scheduled events",
      },
      {
        scope: 'write:invitees',
        description:
          'Create and update access to information about event invitees',
      },
      {
        scope: 'read:webhooks',
        description: 'Read access to webhook subscriptions',
      },
      {
        scope: 'write:webhooks',
        description: 'Create and update access to webhook subscriptions',
      },
      {
        scope: 'read:organization',
        description:
          'Read access to organization information (for enterprise accounts)',
      },
      {
        scope: 'write:organization',
        description:
          'Write access to organization information (for enterprise accounts)',
      },
      {
        scope: 'openid',
        description: 'Required for OIDC authentication flows',
      },
    ],
  },
} satisfies JsonConnectorDef

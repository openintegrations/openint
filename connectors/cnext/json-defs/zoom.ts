import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['streaming'],
  display_name: 'Zoom',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://zoom.us/oauth/authorize',
    token_request_url: 'https://zoom.us/oauth/token',
    scope_separator: ',',
    params_config: {authorize: {response_type: 'code'}},
    required_scopes: ['openid', 'offline_access'],
    openint_default_scopes: [
      'user:read:user:admin',
      'offline_access',
      'meeting:read:list_meetings:admin',
      'meeting:read:summary:admin',
      'offline_access',
    ],
    openint_allowed_scopes: [
      'user:read:user:admin',
      'user:read:settings:admin',
      'meeting:read:list_meetings:admin',
      'meeting:read:summary:admin',
      'meeting:read:participant:admin',
      'webinar:read:webinar:admin',
      'offline_access',
    ],
    scopes: [
      {
        scope: 'user:read',
        description:
          "Allows read-only access to user's basic information (e.g., name, email, profile picture).",
      },
      {
        scope: 'openid',
        description:
          'Required for OAuth 2.0 authorization flows. Enables basic user authentication and ID token issuance.',
      },
      {
        scope: 'meeting:read',
        description:
          'Allows read-only access to meeting details (e.g., topic, time, participants).',
      },
      {
        scope: 'meeting:write',
        description:
          'Allows creating, updating, and deleting meetings on behalf of the user.',
      },
      {
        scope: 'recording:read',
        description:
          'Allows read-only access to cloud recordings and transcripts.',
      },
      {
        scope: 'recording:write',
        description:
          'Allows managing cloud recordings (e.g., deleting, downloading).',
      },
      {
        scope: 'user:write',
        description: 'Allows updating user settings and profile information.',
      },
    ],
  },
} satisfies JsonConnectorDef

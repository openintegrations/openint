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
    required_scopes: ['user:read:user:admin'],
    openint_default_scopes: [
      'user:read:user:admin',
      'meeting:read:list_meetings:admin',
      'meeting:read:summary:admin',
    ],
    openint_allowed_scopes: [
      'user:read:user:admin',
      'user:read:settings:admin',
      'meeting:read:list_meetings:admin',
      'meeting:read:summary:admin',
      'meeting:read:participant:admin',
      'webinar:read:webinar:admin',
    ],
    scopes: [
      {
        scope: 'user:read',
        description:
          "Allows read-only access to user's basic information (e.g., name, email, profile picture).",
      },
      {
        scope: 'user:read:user:admin',
        description:
          'Allows admin-level read access to user account information and settings.',
      },
      {
        scope: 'user:read:settings:admin',
        description:
          'Allows admin-level read access to user settings and configurations.',
      },
      {
        scope: 'meeting:read:list_meetings:admin',
        description:
          'Allows admin-level read access to list and view meeting details.',
      },
      {
        scope: 'meeting:read:summary:admin',
        description:
          'Allows admin-level read access to meeting summaries and reports.',
      },
      {
        scope: 'meeting:read:participant:admin',
        description:
          'Allows admin-level read access to meeting participant information.',
      },
      {
        scope: 'webinar:read:webinar:admin',
        description:
          'Allows admin-level read access to webinar details and information.',
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

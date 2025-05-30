import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Slack',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://slack.com/oauth/v2/authorize',
    token_request_url: 'https://slack.com/api/oauth.v2.access',
    scope_separator: ',',
    params_config: {},
    openint_default_scopes: ['users:read'],
    openint_allowed_scopes: ['users:read'],
    /**
     * Go to: https://api.slack.com/apps -> select openint
     * Add the scopes as necessary
     */
    scopes: [
      {
        scope: 'app_mentions:read',
        description:
          'Allows the app to view messages that directly mention the app in channels it has access to.',
      },
      {
        scope: 'channels:read',
        description:
          'Allows the app to view basic information about public channels in the workspace, including channel names, topics, and purposes.',
      },
      {
        scope: 'channels:history',
        description:
          'Allows the app to view messages and other content in public channels.',
      },
      {
        scope: 'channels:write',
        description:
          'Allows the app to create, rename, and archive public channels, as well as set their purpose and topic.',
      },
      {
        scope: 'chat:write',
        description:
          'Allows the app to post messages in channels and conversations it has access to.',
      },
      {
        scope: 'commands',
        description:
          'Allows the app to add custom slash commands that users can invoke in Slack.',
      },
      {
        scope: 'im:history',
        description:
          'Allows the app to view messages and other content in direct messages.',
      },
      {
        scope: 'im:write',
        description:
          'Allows the app to start direct message conversations with users.',
      },
      {
        scope: 'users:read',
        description:
          'Allows the app to view basic information about users in the workspace, including names, emails, and avatars.',
      },
      {
        scope: 'users:read.email',
        description:
          'Allows the app to view email addresses of users in the workspace (in addition to basic user information).',
      },
      {
        scope: 'users.profile:read',
        description:
          "Allows the app to view users' profile details, including custom profile fields.",
      },
      {
        scope: 'admin',
        description:
          'Allows the app to perform administrative actions, including managing users, channels, and workspace settings.',
      },
      {
        scope: 'files:read',
        description:
          'Allows the app to view files shared in channels and conversations it has access to.',
      },
      {
        scope: 'files:write',
        description:
          'Allows the app to upload, edit, and delete files in channels and conversations it has access to.',
      },
    ],
  },
} satisfies JsonConnectorDef

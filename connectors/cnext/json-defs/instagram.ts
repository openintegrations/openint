import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Instagram',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://api.instagram.com/oauth/authorize',
    token_request_url: 'https://api.instagram.com/oauth/access_token',
    scope_separator: ',',
    params_config: {},
    openint_scopes: ['instagram_basic'],
    scopes: [
      {
        scope: 'user_profile',
        description:
          "Provides access to the user's profile information including username, profile picture, and account type (Business or Personal).",
      },
      {
        scope: 'user_media',
        description:
          "Provides access to the user's media (photos and videos) including metadata, captions, and comments.",
      },
      {
        scope: 'instagram_basic',
        description:
          "Provides basic access to a user's profile information, username, and profile picture. This is the most limited scope.",
      },
      {
        scope: 'pages_show_list',
        description:
          'Provides access to the list of Instagram Pages a user manages. Required for accessing Page-related features.',
      },
      {
        scope: 'instagram_content_publish',
        description:
          'Allows the app to publish content (photos and videos) on behalf of the user.',
      },
      {
        scope: 'instagram_manage_comments',
        description:
          "Allows the app to read and manage comments on the user's media.",
      },
      {
        scope: 'instagram_manage_insights',
        description:
          'Provides access to business account insights and metrics.',
      },
      {
        scope: 'ads_management',
        description:
          'Provides access to manage ads and campaigns for Instagram business accounts.',
      },
    ],
  },
} satisfies JsonConnectorDef

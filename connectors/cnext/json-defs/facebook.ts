import type {JsonConnectorDef} from '../schema'

export const jsonDef = {
  audience: ['business'],
  verticals: ['social-media'],
  display_name: 'Facebook',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://www.facebook.com/v15.0/dialog/oauth',
    token_request_url: 'https://graph.facebook.com/v15.0/oauth/access_token',
    scope_separator: ' ',
    params_config: {},
    openint_scopes: ['email'],
    scopes: [
      {
        scope: 'email',
        description: "Provides access to the user's primary email address.",
      },
      {
        scope: 'public_profile',
        description:
          "Provides access to basic information available on the user's profile (id, name, first_name, last_name, age_range, link, gender, locale, timezone, updated_time, verified).",
      },
      {
        scope: 'user_friends',
        description:
          "Provides access to the user's list of friends who also use the app.",
      },
      {
        scope: 'user_posts',
        description:
          "Provides access to the posts on the user's timeline, including their own posts and posts they're tagged in.",
      },
      {
        scope: 'user_photos',
        description:
          'Provides access to the photos the user has uploaded to Facebook.',
      },
      {
        scope: 'user_likes',
        description:
          'Provides access to the list of pages, places, or things the user has liked.',
      },
      {
        scope: 'user_status',
        description: "Provides access to the user's status updates.",
      },
      {
        scope: 'user_events',
        description:
          'Provides access to the events the user is attending or has created.',
      },
      {
        scope: 'manage_pages',
        description:
          "Provides access to manage the user's Facebook pages (requires additional permissions).",
      },
      {
        scope: 'publish_to_groups',
        description:
          'Allows the app to post content to groups the user belongs to.',
      },
    ],
  },
} satisfies JsonConnectorDef

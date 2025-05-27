import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['social-media', 'streaming'],
  display_name: 'Twitch',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://id.twitch.tv/oauth2/authorize',
    token_request_url: 'https://id.twitch.tv/oauth2/token',
    scope_separator: ' ',
    params_config: {
      authorize: {force_verify: 'false', response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['openid'],
    openint_allowed_scopes: ['openid', 'user:read:email', 'analytics:read:games'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Allows the application to authenticate the user and request basic profile information (subject and issuer) using OpenID Connect.',
      },
      {
        scope: 'user:read:email',
        description:
          "Allows read access to the user's email address. This is the smallest surface area scope as it only grants access to the email and no other user data.",
      },
      {
        scope: 'analytics:read:extensions',
        description:
          "Allows read access to analytics data for the user's extensions.",
      },
      {
        scope: 'analytics:read:games',
        description:
          "Allows read access to analytics data for the user's games.",
      },
      {
        scope: 'bits:read',
        description: 'Allows read access to Bits information for a channel.',
      },
      {
        scope: 'channel:edit:commercial',
        description:
          "Allows the application to start commercials on the user's channel.",
      },
      {
        scope: 'channel:manage:broadcast',
        description:
          "Allows management of the user's channel configuration, including stream metadata and markers.",
      },
      {
        scope: 'channel:read:charity',
        description:
          "Allows read access to charity campaign details on the user's channel.",
      },
      {
        scope: 'clips:edit',
        description:
          "Allows the application to create clips from the user's streams.",
      },
      {
        scope: 'moderation:read',
        description:
          'Allows read access to moderation data such as banned users and moderator actions.',
      },
      {
        scope: 'moderator:manage:announcements',
        description:
          'Allows the application to send announcements in channels where the user is a moderator.',
      },
      {
        scope: 'moderator:manage:chat_messages',
        description:
          'Allows the application to delete or clear chat messages in channels where the user is a moderator.',
      },
      {
        scope: 'user:edit',
        description:
          "Allows the application to update the user's profile information.",
      },
      {
        scope: 'user:read:broadcast',
        description:
          "Allows read access to the user's broadcasting configuration, including stream key.",
      },
      {
        scope: 'user:read:follows',
        description:
          'Allows read access to the list of channels the user follows.',
      },
      {
        scope: 'channel:moderate',
        description:
          "Allows the application to perform moderation actions in the user's channel, such as banning or timing out users.",
      },
      {
        scope: 'chat:edit',
        description:
          'Allows the application to send messages on behalf of the user in chat.',
      },
      {
        scope: 'chat:read',
        description:
          'Allows the application to read chat messages in channels where the user has moderator privileges.',
      },
      {
        scope: 'whispers:read',
        description:
          'Allows the application to read whispers sent to and from the user.',
      },
      {
        scope: 'whispers:edit',
        description:
          'Allows the application to send whispers on behalf of the user.',
      },
    ],
  },
} satisfies JsonConnectorDef

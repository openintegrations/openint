import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

export const jsonDef = {
  audience: ['business'],
  connector_name: 'discord',
  verticals: ['social-media'],
  display_name: 'Discord',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://discord.com/api/oauth2/authorize',
    token_request_url: 'https://discord.com/api/oauth2/token',
    scope_separator: ' ',
    params_config: {authorize: {response_type: 'code'}},
    openint_scopes: ['identify'],
    scopes: [
      {
        scope: 'identify',
        description:
          "Allows fetching the user's basic information (user ID, username, avatar, discriminator, etc.) without the email. This is read-only access to very basic profile data.",
      },
      {
        scope: 'email',
        description:
          "Provides access to the user's email address (requires the identify scope). This grants access to just one additional sensitive piece of information.",
      },
      {
        scope: 'connections',
        description:
          "Allows access to the user's connected third-party accounts (like Steam, Battle.net, etc.). This reveals linked external services.",
      },
      {
        scope: 'guilds',
        description:
          "Provides read-only access to the list of servers the user is in (server IDs and basic info). Doesn't reveal server contents.",
      },
      {
        scope: 'guilds.join',
        description:
          "Allows your app to join servers on the user's behalf. This is a write operation with moderate privileges.",
      },
      {
        scope: 'gdm.join',
        description:
          "Allows joining group DMs on the user's behalf. This is a write operation for private messaging.",
      },
      {
        scope: 'messages.read',
        description:
          'Allows reading messages in private channels (DMs and group DMs) the user has access to. This is high-privilege read access.',
      },
      {
        scope: 'bot',
        description:
          'Standard bot scope used for bot authorization. When used with bot permissions, can grant extensive access to servers.',
      },
      {
        scope: 'webhook.incoming',
        description:
          'Allows generating webhook URLs for a channel, enabling posting messages as the webhook. This is a channel-specific write permission.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)

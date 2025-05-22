import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
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
    openint_default_scopes: ['identify'],
    openint_allowed_scopes: ['identify', 'email', 'guilds'],
    /**
     * Go to: https://discord.com/developers/docs/topics/oauth2
     * Review OAuth2 Scopes and update as needed
     */
    scopes: [
      {
        scope: 'activities.read',
        description:
          'Allows your app to fetch data from a user\'s "Now Playing/Recently Played" list — not currently available for apps',
      },
      {
        scope: 'activities.write',
        description:
          "Allows your app to update a user's activity - not currently available for apps (NOT REQUIRED FOR GAMESDK ACTIVITY MANAGER)",
      },
      {
        scope: 'applications.builds.read',
        description:
          "Allows your app to read build data for a user's applications",
      },
      {
        scope: 'applications.builds.upload',
        description:
          "Allows your app to upload/update builds for a user's applications - requires Discord approval",
      },
      {
        scope: 'applications.commands',
        description:
          'Allows your app to add commands to a guild - included by default with the bot scope',
      },
      {
        scope: 'applications.commands.update',
        description:
          'Allows your app to update its commands using a Bearer token - client credentials grant only',
      },
      {
        scope: 'applications.commands.permissions.update',
        description:
          'Allows your app to update permissions for its commands in a guild a user has permissions to',
      },
      {
        scope: 'applications.entitlements',
        description:
          "Allows your app to read entitlements for a user's applications",
      },
      {
        scope: 'applications.store.update',
        description:
          "Allows your app to read and update store data (SKUs, store listings, achievements, etc.) for a user's applications",
      },
      {
        scope: 'bot',
        description:
          "For OAuth2 bots, this puts the bot in the user's selected guild by default",
      },
      {
        scope: 'connections',
        description:
          'Allows /users/@me/connections to return linked third-party accounts',
      },
      {
        scope: 'dm_channels.read',
        description:
          "Allows your app to see information about the user's DMs and group DMs - requires Discord approval",
      },
      {
        scope: 'email',
        description: 'Enables /users/@me to return an email',
      },
      {
        scope: 'gdm.join',
        description: 'Allows your app to join users to a group DM',
      },
      {
        scope: 'guilds',
        description:
          "Allows /users/@me/guilds to return basic information about all of a user's guilds",
      },
      {
        scope: 'guilds.join',
        description:
          'Allows /guilds/{guild.id}/members/{user.id} to be used for joining users to a guild',
      },
      {
        scope: 'guilds.members.read',
        description:
          "Allows /users/@me/guilds/{guild.id}/member to return a user's member information in a guild",
      },
      {
        scope: 'identify',
        description: 'Allows /users/@me without email',
      },
      {
        scope: 'messages.read',
        description:
          'For local RPC server API access, this allows you to read messages from all client channels (otherwise restricted to channels/guilds your app creates)',
      },
      {
        scope: 'relationships.read',
        description:
          "Allows your app to know a user's friends and implicit relationships - requires Discord approval",
      },
      {
        scope: 'role_connections.write',
        description:
          "Allows your app to update a user's connection and metadata for the app",
      },
      {
        scope: 'rpc',
        description:
          "For local RPC server access, this allows you to control a user's local Discord client - requires Discord approval",
      },
      {
        scope: 'rpc.activities.write',
        description:
          "For local RPC server access, this allows you to update a user's activity - requires Discord approval",
      },
      {
        scope: 'rpc.notifications.read',
        description:
          'For local RPC server access, this allows you to receive notifications pushed out to the user - requires Discord approval',
      },
      {
        scope: 'rpc.voice.read',
        description:
          "For local RPC server access, this allows you to read a user's voice settings and listen for voice events - requires Discord approval",
      },
      {
        scope: 'rpc.voice.write',
        description:
          "For local RPC server access, this allows you to update a user's voice settings - requires Discord approval",
      },
      {
        scope: 'voice',
        description:
          "Allows your app to connect to voice on user's behalf and see all the voice members - requires Discord approval",
      },
      {
        scope: 'webhook.incoming',
        description:
          'This generates a webhook that is returned in the OAuth token response for authorization code grants',
      },
    ],
  },
} satisfies JsonConnectorDef

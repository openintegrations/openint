import type {JsonConnectorDef} from '../schema'

import {z} from '@openint/util/zod-utils'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Battle.net',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url:
      'https://oauth.battle.${connection_settings.extension}/authorize',
    token_request_url:
      'https://oauth.battle.${connection_settings.extension}/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    required_scopes: ['openid', 'profile'],
    openint_default_scopes: ['openid', 'profile', 'sc2.profile'],
    openint_allowed_scopes: ['openid', 'profile', 'sc2.profile'],
    scopes: [
      {
        scope: 'openid',
        description:
          'Provides access to basic user profile information (BattleTag) and enables OpenID Connect functionality. This is the minimal scope required for authentication.',
      },
      {
        scope: 'sc2.profile',
        description:
          'Read access to StarCraft II profile data including achievements, rankings, and match history.',
      },
      {
        scope: 'wow.profile',
        description:
          'Read access to World of Warcraft profile data including characters, achievements, and game status.',
      },
      {
        scope: 'd3.profile',
        description:
          'Read access to Diablo III profile data including heroes, items, and progression.',
      },
      {
        scope: 'profile',
        description:
          "Provides access to the user's Battle.net account profile information including BattleTag and account ID.",
      },
    ],
    connection_settings: z.object({
      extension: z
        .string()
        .regex(/[a-z.]+/)
        .describe(
          'The domain extension of your Battle.net account (e.g., com)',
        ),
      apiDomain: z
        .string()
        .regex(/https:\/\/([a-z.]+)/)
        .describe(
          'The domain to where you will access your API (e.g., https://us.api.blizzard.com)',
        ),
    }),
  },
} satisfies JsonConnectorDef

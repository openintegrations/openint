import type {JsonConnectorDef} from '../schema'

export default {
  audience: ['business'],
  verticals: ['other'],
  display_name: 'Spotify (OAuth)',
  stage: 'alpha',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.spotify.com/authorize',
    token_request_url: 'https://accounts.spotify.com/api/token',
    scope_separator: ' ',
    params_config: {
      authorize: {response_type: 'code'},
      token: {grant_type: 'authorization_code'},
    },
    openint_default_scopes: ['user-read-private'],
    openint_allowed_scopes: ['user-read-private', 'user-read-email', 'playlist-read-private'],
    scopes: [
      {
        scope: 'user-read-private',
        description:
          "Read access to user's subscription details (product type) and explicit content settings. Required for basic user identification in most authorization flows.",
      },
      {
        scope: 'user-read-email',
        description:
          "Read access to user's email address. This is the smallest scope as it only exposes the email and no other user data.",
      },
      {
        scope: 'playlist-read-private',
        description: "Read access to user's private playlists.",
      },
      {
        scope: 'playlist-read-collaborative',
        description: "Read access to user's collaborative playlists.",
      },
      {
        scope: 'playlist-modify-public',
        description: 'Write access to create/modify public playlists.',
      },
      {
        scope: 'playlist-modify-private',
        description: 'Write access to create/modify private playlists.',
      },
      {
        scope: 'user-library-read',
        description: "Read access to user's saved tracks and albums.",
      },
      {
        scope: 'user-library-modify',
        description:
          "Write access to add/remove tracks or albums in user's library.",
      },
      {
        scope: 'user-top-read',
        description: "Read access to user's top tracks and artists.",
      },
      {
        scope: 'user-read-playback-state',
        description:
          "Read access to user's playback state (current track, device, etc.).",
      },
      {
        scope: 'user-modify-playback-state',
        description:
          'Write access to control playback (play, pause, skip, etc.).',
      },
      {
        scope: 'user-read-currently-playing',
        description: "Read access to user's currently playing track.",
      },
      {
        scope: 'user-read-recently-played',
        description: "Read access to user's recently played tracks.",
      },
      {
        scope: 'streaming',
        description:
          'Required for playback control (e.g., via Web Playback SDK).',
      },
      {
        scope: 'app-remote-control',
        description:
          'Access to control Spotify app remotely (e.g., via Spotify Connect).',
      },
    ],
  },
} satisfies JsonConnectorDef

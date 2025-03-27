import {generateOAuth2Server} from '../_defaults'
import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

const jsonDef = {
  audience: ['business'],
  connector_name: 'googlesheet',
  verticals: ['flat-files-and-spreadsheets'],
  display_name: 'Google Sheet',
  stage: 'ga',
  version: 1,
  auth: {
    type: 'OAUTH2',
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    openint_scopes: [
      'https://www.googleapis.com/auth/drive.file',
    ],
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        description: 'See, edit, create, and delete all your Google Sheets spreadsheets.',
      },
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        description: 'See all your Google Sheets spreadsheets.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description: 'See, edit, create, and delete all of your Google Drive files.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description: 'See, edit, create, and delete only the specific Google Drive files you use with this app.',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description: 'See and download all your Google Drive files.',
      },
      {
        scope: 'https://www.googleapis.com/auth/spreadsheets.currentonly',
        description: 'Provides read/write access only to the currently opened Google Sheet. This is the most restrictive scope, limiting access to a single spreadsheet at a time.',
      },
    ],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)

export const server = generateOAuth2Server(def, jsonDef.auth)

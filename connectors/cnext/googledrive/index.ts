import {generateOAuth2Server} from '../_defaults'
import {generateOauthConnectorDef} from '../_defaults/oauth2/schema'
import type {JsonConnectorDef} from '../def'

const jsonDef = {
  audience: ['consumer', 'business'] as const,
  connector_name: 'googledrive' as const,
  verticals: ['file-storage'] as const,
  display_name: 'Google Drive' as const,
  stage: 'ga' as const,
  version: 1 as const,
  links: {
    web_url: 'https://drive.google.com',
    api_docs_url: 'https://developers.google.com/drive',
  },
  auth: {
    type: 'OAUTH2' as const,
    authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
    token_request_url: 'https://oauth2.googleapis.com/token',
    scope_separator: ' ',
    params_config: {
      authorize: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
    scopes: [
      {
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        description: 'View files and folders in your Google Drive',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive.file',
        description: 'View and manage files created by this app',
      },
      {
        scope: 'https://www.googleapis.com/auth/drive',
        description: 'Full access to files and folders in your Google Drive',
      },
    ],
    default_scopes: ['https://www.googleapis.com/auth/drive.file'],
  },
} satisfies JsonConnectorDef

export const def = generateOauthConnectorDef(jsonDef)

export const server = generateOAuth2Server(def, jsonDef.auth)

/*
  Next: 
    - xx Move keys of json connector def to as const in the def file
    - Manually test 
    - review generics and schemas, return types, ts-ignores and <any> casts
    - General code review
    - Script to generate the jsonconnector config def from the connector def based on input 
  */

import {generateOAuth2Server} from '../_defaults'
import type {JsonConnectorDef} from '../def'
import {generateConnectorDef} from '../schema'

const connectorDef = {
  audience: ['consumer', 'business'],
  connector_name: 'googledrive' as const,
  verticals: ['file-storage'],
  display_name: 'Google Drive',
  stage: 'ga',
  version: 1,
  links: {
    web_url: 'https://drive.google.com',
    api_docs_url: 'https://developers.google.com/drive',
  },
  auth: {
    type: 'OAUTH2',
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
    openint_scopes: ['https://www.googleapis.com/auth/drive.file'],
  },
  // TODO (@pellicceama)
  // --> Dropped this req:  1) Get rid of code handlers in def and put it inside `server` instead. def should be json serializable only
  // xx2) Have the custom handlers be auth-type specific which then gets normalized into
  //xx 3) our getPreConnectParams, preConnect, postConnect lifecycle
  // Discuss with @openint-bot 4) Ability to extend standard auth schema, not just override it (e.g. QBO realm_id)
  // xx 5) Nest auth fields under an auth object, limit # of fields on top level, continue to leverage the discriminated union
  // xx 6) Allow for simple variable substitutions in connector def based on connection.settings or connector_config.config
  // xx 7) Scope should list all possible scopes this oauth connectors we know of, but it's a best effort at then end of day and allow user to specify custom ones..
  // xx 8) Add audience and other fields to full ConnectionDef.metadata so that the new metadata appears in the connector APIs
  // xx 10) Have a generic way to create connector server simplified that allows me to access connector specific fields as part
  //     of handlers like check connnection (think api key auth)
  // zod
} satisfies JsonConnectorDef

export const def = generateConnectorDef(connectorDef)
export const server = generateOAuth2Server(def, connectorDef.auth)

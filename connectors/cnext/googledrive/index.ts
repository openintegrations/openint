import {generateOAuth2Server} from '../_defaults'
import type {JsonConnectorDef} from '../def'
import {generateConnectorDef} from '../schema'

const jsonDef = {
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
  // - [ ] change openint_scope to default scope
  // - [ ] Handle local urls dynmaically
  // - [ ] reembmer to fix logoUrl in metadata
  // - [ ] Remember to fix template literal in values
  // - [ ] Use token info endpoint for check connection by default, add def for endpoint

  // Discuss with @openint-bot 4) Ability to extend standard auth schema, not just override it (e.g. QBO realm_id)
  // xx 7) Scope should list all possible scopes this oauth connectors we know of, but it's a best effort at then end of day and allow user to specify custom ones..
  // xx 10) Have a generic way to create connector server simplified that allows me to access connector specific fields as part
  //     of handlers like check connnection (think api key auth)
  // zod

  /*
  Next: 
    - Move keys of json connector def to as const in the def file
    - Manually test 
    - Point 4 above 
    - review generics and schemas, return types, ts-ignores and <any> casts
    - General code review
    - Script to generate the jsonconnector config def from the connector def based on input 
  */
} satisfies JsonConnectorDef

export const def = generateConnectorDef(jsonDef)
export const server = generateOAuth2Server(def, jsonDef.auth, {
  // oauth2: {
  // },
  // server: {
  // }
})

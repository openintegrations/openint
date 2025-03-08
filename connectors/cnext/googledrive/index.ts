import {generateConnectorServerV1} from '../_defaults'
import {ConnectorDef} from '../def'
import {generateConnectorDef} from '../schema'

const connectorDef = {
  audience: ['consumer', 'business'],
  connector_name: 'googledrive',
  verticals: ['file-storage'],
  display_name: 'Google Drive',
  readiness: 'ga',
  version: 1,
  links: {
    web_url: 'https://drive.google.com',
    api_docs_url: 'https://developers.google.com/drive',
  },
  auth_type: 'OAUTH2',
  authorization_request_url: 'https://accounts.google.com/o/oauth2/v2/auth',
  token_request_url: 'https://oauth2.googleapis.com/token',
  auth_scope_separator: ' ',
  auth_params: {
    authorize: {
      access_type: 'offline',
      prompt: 'consent',
    },
    capture_response_fields: ['id'],
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
  handlers: {}, // TODO: figure out how to not make this required
} satisfies ConnectorDef

export const def = generateConnectorDef(connectorDef)
export const server = generateConnectorServerV1(connectorDef)

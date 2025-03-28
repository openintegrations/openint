import {
  def as connectorGoogledrive_def,
  server as connectorGoogledrive_server,
} from './googledrive'
import {
  def as connectorGooglesheet_def,
  server as connectorGooglesheet_server,
} from './googlesheet'

// generated by _generateConnectorLists.ts. Do not modify by hand
export type {JsonConnectorDef} from './def'
export type {AuthType} from './def'

export {
  connectorGoogledrive_server,
  connectorGoogledrive_def,
  connectorGooglesheet_server,
  connectorGooglesheet_def,
}

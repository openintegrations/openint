import type {AdapterMap} from '@openint/vdk'
import {
  googleAdapter,
  downloadFileById as googleDownloadFileById,
} from './google-adapter'
import {
  sharepointAdapter,
  downloadFileById as sharepointDownloadFileById,
} from './sharepoint-adapter'

export default {
  microsoft: sharepointAdapter,
  google: googleAdapter,
} satisfies AdapterMap

export const downloadFileById = {
  microsoft: sharepointDownloadFileById,
  google: googleDownloadFileById,
}

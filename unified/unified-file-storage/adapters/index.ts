import type {AdapterMap} from '@openint/vdk'
import {
  sharepointAdapter,
  downloadFileById as sharepointDownloadFileById,
} from './sharepoint-adapter'

export default {
  microsoft: sharepointAdapter,
} satisfies AdapterMap

export const downloadFileById = {
  microsoft: sharepointDownloadFileById,
}

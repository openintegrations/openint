import type {AdapterMap} from '@openint/vdk'
import {sharepointAdapter} from './sharepoint-adapter'

export default {
  microsoft: sharepointAdapter,
} satisfies AdapterMap

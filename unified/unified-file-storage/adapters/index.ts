import type {AdapterMap} from '@openint/vdk'
import {microsoftGraphAdapter} from './microsoft-adapter'

export default {
  microsoft: microsoftGraphAdapter,
} satisfies AdapterMap

import type {AdapterMap} from '@openint/vdk'
import {microsoftGraphAdapter} from './microsoft-adapter'
import {googleDriveAdapter} from './google-adapter'

export default {
  microsoft: microsoftGraphAdapter,
  google: googleDriveAdapter,
} satisfies AdapterMap

// Write the metadata file
import {join} from 'path'
import type {ConnectorDef} from '@openint/cdk'

import {R} from '@openint/util/remeda'
import {clientConnectors} from '../connectors.client'
import {defConnectors} from '../connectors.def'
import {customConnectors as customServerConnectors} from '../connectors.server'
import {writePretty} from './writePretty'

// Get all unique connector names
const allConnectors = Object.keys(defConnectors).sort()

// Generate the metadata file content
// Build metadata object first
const metadata = Object.fromEntries(
  Object.entries(defConnectors)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, def]: [string, ConnectorDef]) => [
      name,
      {
        hasClient: name in clientConnectors,
        hasServer: name in customServerConnectors,
        // omit jsonDef and openapiSpec to reduce size of metadata file
        metadata: R.omit(def.metadata ?? {}, ['jsonDef', 'openapiSpec']),
      },
    ]),
)

const metadataContent = `
export default ${JSON.stringify(metadata, null, 2)} as const
`

void writePretty(
  'connectors.meta.ts',
  metadataContent,
  join(__dirname, '..'),
).then(() => {
  console.log(`Generated metadata for ${allConnectors.length} connectors`)
})

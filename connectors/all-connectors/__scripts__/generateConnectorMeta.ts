// Write the metadata file
import {join} from 'path'
import {clientConnectors} from '../connectors.client'
import {defConnectors} from '../connectors.def'
import {customConnectors as customServerConnectors} from '../connectors.server'
import {writePretty} from './writePretty'

// Get all unique connector names
const allConnectors = Object.keys(defConnectors).sort()

// Generate the metadata file content
const metadataContent = `

export default {
${allConnectors
  .map(
    (name) => `  '${name}': {
    hasClient: ${name in clientConnectors},
    hasServer: ${name in customServerConnectors}
  }`,
  )
  .join(',\n')}
} as const
`

void writePretty(
  'connectors.meta.ts',
  metadataContent,
  join(__dirname, '..'),
).then(() => {
  console.log(`Generated metadata for ${allConnectors.length} connectors`)
})

import path from 'node:path'
import {defConnectors} from '../connectors.def'
import {writePretty} from './writePretty'

const templateMeta = `
import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'
import {Card} from '@openint/shadcn/ui'

const meta: Meta<typeof JSONSchemaForm> = {
  title: 'All Connectors/$filename',
  component: JSONSchemaForm,
  parameters: {layout: 'centered'},
  decorators: [
    (Story) => (
      <Card className="max-w-lg p-4">
        <Story />
      </Card>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>
`

async function main() {
  const connectorConfigStories = Object.entries(defConnectors)
    .filter(([_, def]) => 'connectorConfig' in def.schemas)
    .map(
      ([name]) => `
    export const ${name}ConnectorConfig: Story = {
      args: {
        jsonSchema: zodToOas31Schema(defConnectors['${name}'].schemas.connectorConfig),
      },
    }
  `,
    )

  const connectionSettingsStories = Object.entries(defConnectors)
    .filter(([_, def]) => 'connectionSettings' in def.schemas)
    .map(
      ([name]) => `
    export const ${name}ConnectionSettings: Story = {
      args: {
        jsonSchema: zodToOas31Schema(defConnectors['${name}'].schemas.connectionSettings),
      },
    }
  `,
    )

  const outputPath = path.join(__dirname, '../../../packages/ui-v1/__stories__')

  await writePretty(
    'ConnectorConfigForm.stories.tsx',
    templateMeta.replace('$filename', 'ConnectorConfigForm') +
      '\n' +
      connectorConfigStories.join('\n'),
    outputPath,
  )

  await writePretty(
    'ConnectionSettingsForm.stories.tsx',
    templateMeta.replace('$filename', 'ConnectionSettingsForm') +
      '\n' +
      connectionSettingsStories.join('\n'),
    outputPath,
  )
}

main()

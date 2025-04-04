import path from 'node:path'
import {defConnectors} from '../connectors.def'
import {writePretty} from './writePretty'

const templateMeta = `
import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

const meta: Meta<typeof JSONSchemaForm> = {
  component: JSONSchemaForm,
  parameters: {layout: 'centered'},
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>
`

async function main() {
  const templateStories = Object.entries(defConnectors)
    .flatMap(([name, def]) => [
      'connectorConfig' in def.schemas &&
        `
    export const ${name}ConnectorConfig: Story = {
      args: {
        jsonSchema: zodToOas31Schema(defConnectors['${name}'].schemas.connectorConfig),
      },
    }
  `,
      'connectionSettings' in def.schemas &&
        `
    export const ${name}ConnectionSettings: Story = {
      args: {
        jsonSchema: zodToOas31Schema(defConnectors['${name}'].schemas.connectionSettings),
      },
    }
  `,
    ])
    .filter((l): l is string => !!l)

  const content = templateMeta + '\n' + templateStories.join('\n')

  const outputPath = path.join(__dirname, '../../../packages/ui-v1/__stories__')
  await writePretty('ConnectorSchemaForm.stories.tsx', content, outputPath)
}

main()

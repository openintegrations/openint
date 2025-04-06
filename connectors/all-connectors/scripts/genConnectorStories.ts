import path from 'node:path'
import {defConnectors} from '../connectors.def'
import {writePretty} from './writePretty'

const templateMeta = `
import type {Meta, StoryObj} from '@storybook/react'
import type {ConnectorName} from '@openint/all-connectors/schemas'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {Card} from '@openint/shadcn/ui'
import {zodToOas31Schema} from '@openint/util/schema'
import {JSONSchemaForm} from '../components/schema-form/JSONSchemaForm'

function FormWrapper(props: {name: ConnectorName}) {
  const schemas = defConnectors[props.name].schemas
  if (!('$key' in schemas)) {
    throw new Error(
      'Connector ' + props.name + ' does not have a $key',
    )
  }

  return (
    <Card className="w-md p-4">
      <h1 className="text-lg font-bold">{props.name} $key</h1>
      <hr />
      <JSONSchemaForm debugMode jsonSchema={zodToOas31Schema(schemas.$key)} />
    </Card>
  )
}

const meta: Meta<typeof FormWrapper> = {
  title: 'All Connectors/$key',
  component: FormWrapper,
  parameters: {layout: 'centered'},
}

export default meta
type Story = StoryObj<typeof meta>
`

async function main() {
  const connectorConfigStories = Object.entries(defConnectors)
    .filter(([_, def]) => 'connector_config' in def.schemas)
    .map(
      ([name]) => `
    export const ${name}ConnectorConfig: Story = {
      args: {name: '${name}'},
    }
  `,
    )

  const connectionSettingsStories = Object.entries(defConnectors)
    .filter(([_, def]) => 'connection_settings' in def.schemas)
    .map(
      ([name]) => `
    export const ${name}ConnectionSettings: Story = {
      args: {name: '${name}'},
    }
  `,
    )

  const outputPath = path.join(__dirname, '../../../packages/ui-v1/__stories__')

  await writePretty(
    'ConnectorConfigForm.stories.tsx',
    templateMeta.replaceAll('$key', 'connector_config') +
      '\n' +
      connectorConfigStories.join('\n'),
    outputPath,
  )

  await writePretty(
    'ConnectionSettingsForm.stories.tsx',
    templateMeta.replaceAll('$key', 'connection_settings') +
      '\n' +
      connectionSettingsStories.join('\n'),
    outputPath,
  )
}

main()

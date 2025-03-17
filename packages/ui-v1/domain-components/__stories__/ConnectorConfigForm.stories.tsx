import type {Meta, StoryObj} from '@storybook/react'
import {defConnectors} from '@openint/all-connectors/connectors.def'
import {ConnectorConfigForm} from '../ConnectorConfigForm'

const meta: Meta<typeof ConnectorConfigForm> = {
  title: 'Domain Components/ConnectorConfigForm',
  component: ConnectorConfigForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    connectorName: {
      control: 'select',
      options: Object.keys(defConnectors).filter(
        (key) =>
          !!defConnectors[key as keyof typeof defConnectors].schemas
            // prettier-ignore
            // @ts-expect-error OK for now, just for storybook
            ?.connectorConfig,
      ),
      description: 'Select a connector to display its configuration form',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectorConfigForm>

export const Default: Story = {
  args: {
    connectorName: 'salesforce',
    onSubmit: (data) => {
      console.log('Form submitted:', data)
      alert('Form submitted! Check console for details.')
    },
  },
}

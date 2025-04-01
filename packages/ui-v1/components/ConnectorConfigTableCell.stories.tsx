import type {Meta, StoryObj} from '@storybook/react'
import {ConnectorConfigTableCell} from './ConnectorConfigTableCell'
import {CopyID} from './CopyID'

const meta: Meta<typeof ConnectorConfigTableCell> = {
  title: 'Components/ConnectorConfigTableCell',
  component: ConnectorConfigTableCell,
  argTypes: {
    name: {
      control: 'text',
      description: 'Name of the connector config',
    },
    id: {
      control: 'text',
      description: 'ID of the connector config',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status of the connector config',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color for the logo container',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the initials',
    },
    simple: {
      control: 'boolean',
      description: 'Whether to show the simple variant',
    },
    compact: {
      control: 'boolean',
      description:
        'Whether to show the compact variant (just logo and ID, no name)',
    },
    useIcon: {
      control: 'boolean',
      description: 'Whether to use a settings icon instead of initials',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectorConfigTableCell>

export const Default: Story = {
  args: {
    name: 'Salesforce Connector Config',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#e0f2fe',
    textColor: '#0ea5e9',
  },
}

export const Simple: Story = {
  args: {
    name: 'Salesforce Connector Config',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#e0f2fe',
    textColor: '#0ea5e9',
    simple: true,
  },
}

export const WithIcon: Story = {
  args: {
    name: 'Salesforce Connector Config',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#e0f2fe',
    textColor: '#0ea5e9',
    useIcon: true,
  },
}

export const Compact: Story = {
  args: {
    name: 'Salesforce Connector Config',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#e0f2fe',
    textColor: '#0ea5e9',
    compact: true,
    useIcon: true,
  },
}

export const WithDifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectorConfigTableCell
        name="Salesforce Connector Config"
        id="12345678"
        status="healthy"
        backgroundColor="#e0f2fe"
        textColor="#0ea5e9"
      />
      <ConnectorConfigTableCell
        name="HubSpot Connector Config"
        id="87654321"
        status="warning"
        backgroundColor="#dbeafe"
        textColor="#3b82f6"
        useIcon={true}
      />
      <ConnectorConfigTableCell
        name="Zendesk Connector Config"
        id="24681357"
        status="offline"
        backgroundColor="#e0e7ff"
        textColor="#6366f1"
        simple={true}
      />
      <ConnectorConfigTableCell
        name="Stripe Connector Config"
        id="13572468"
        status="destructive"
        backgroundColor="#dbeafe"
        textColor="#3b82f6"
        compact={true}
      />
      <ConnectorConfigTableCell
        name="GitHub Connector Config"
        id="56789012"
        status="healthy"
        backgroundColor="#e0f2fe"
        textColor="#0ea5e9"
        compact={true}
        useIcon={true}
      />
    </div>
  ),
}

export const CopyIDOnly: Story = {
  render: () => (
    <div className="p-4">
      <CopyID value="CCFGID_12345678" width={300} size="medium" />
    </div>
  ),
}

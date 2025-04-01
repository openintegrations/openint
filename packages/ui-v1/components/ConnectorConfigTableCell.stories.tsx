import type {Meta, StoryObj} from '@storybook/react'
import {ConnectorConfigTableCell} from './ConnectorConfigTableCell'
import {CopyID} from './CopyID'

const meta: Meta<typeof ConnectorConfigTableCell> = {
  title: 'Tables/ConnectorConfigTableCell',
  component: ConnectorConfigTableCell,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      type: 'boolean',
      description: 'Whether to show the compact variant (just logo and ID)',
      control: {type: 'boolean'},
    },
    simple: {
      type: 'boolean',
      description: 'Whether to show the simple variant (logo and name only)',
      control: {type: 'boolean'},
    },
    status: {
      options: ['healthy', 'warning', 'destructive', 'offline'],
      control: {type: 'select'},
      description: 'Status of the connector config',
    },
    backgroundColor: {
      control: 'color',
      description: 'Brand color for the logo background',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the logo text',
    },
  },
} satisfies Meta<typeof ConnectorConfigTableCell>

export default meta
type Story = StoryObj<typeof ConnectorConfigTableCell>

export const Default: Story = {
  args: {
    connectorConfig: {
      id: '123456',
      display_name: 'HubSpot CRM Config',
      connector_name: 'hubspot',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      disabled: false,
      org_id: 'org-123',
    },
    status: 'warning',
    simple: false,
    compact: false,
    backgroundColor: '#f1f5f9',
    textColor: '#666666',
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

export const WithCompactVariant: Story = {
  args: {
    connectorConfig: {
      id: '123456',
      display_name: 'HubSpot CRM Config',
      connector_name: 'hubspot',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      disabled: false,
      org_id: 'org-123',
    },
    status: 'healthy',
    simple: false,
    compact: true,
    backgroundColor: '#f1f5f9',
    textColor: '#666666',
  },
}

export const WithSimpleVariant: Story = {
  args: {
    connectorConfig: {
      id: '123456',
      display_name: 'HubSpot CRM Config',
      connector_name: 'hubspot',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      disabled: false,
      org_id: 'org-123',
    },
    status: 'offline',
    simple: true,
    compact: false,
    backgroundColor: '#f1f5f9',
    textColor: '#666666',
  },
}

export const WithWarningStatus: Story = {
  args: {
    connectorConfig: {
      id: '123456',
      display_name: 'HubSpot CRM Config',
      connector_name: 'hubspot',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      disabled: false,
      org_id: 'org-123',
    },
    status: 'warning',
    simple: false,
    compact: false,
    backgroundColor: '#f1f5f9',
    textColor: '#666666',
  },
}

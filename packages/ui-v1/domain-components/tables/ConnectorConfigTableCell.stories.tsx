import type {Meta, StoryObj} from '@storybook/react'

import {CopyID} from '../../components/CopyID'
import {ConnectorConfigTableCell} from './ConnectorConfigTableCell'

// Define a meta configurator for the ConnectorConfigTableCell component
const meta = {
  title: 'Tables/ConnectorConfigTableCell',
  component: ConnectorConfigTableCell,
  tags: ['autodocs'],
  // Define argTypes to control the ConnectorConfigTableCell props
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
  },
} satisfies Meta<typeof ConnectorConfigTableCell>

export default meta
type Story = StoryObj<typeof ConnectorConfigTableCell>

// Define a default story for the ConnectorConfigTableCell
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
      metadata: {},
      config: {},
    },
    status: 'warning',
    simple: false,
    compact: false,
  },
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
      metadata: {},
      config: {},
    },
    status: 'healthy',
    simple: false,
    compact: true,
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
      metadata: {},
      config: {},
    },
    status: 'offline',
    simple: true,
    compact: false,
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
      metadata: {},
      config: {},
    },
    status: 'warning',
    simple: false,
    compact: false,
  },
}

export const WithDifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectorConfigTableCell
        connectorConfig={{
          id: '123456',
          display_name: 'Salesforce Connector Config',
          connector_name: 'salesforce',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          disabled: false,
          org_id: 'org-123',
          metadata: {},
          config: {},
        }}
        status="healthy"
      />
      <ConnectorConfigTableCell
        connectorConfig={{
          id: '234567',
          display_name: 'HubSpot Connector Config',
          connector_name: 'hubspot',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          disabled: false,
          org_id: 'org-123',
          metadata: {},
          config: {},
        }}
        status="warning"
      />
      <ConnectorConfigTableCell
        connectorConfig={{
          id: '345678',
          display_name: 'Zendesk Connector Config',
          connector_name: 'zendesk',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          disabled: false,
          org_id: 'org-123',
          metadata: {},
          config: {},
        }}
        status="offline"
        simple={true}
      />
      <ConnectorConfigTableCell
        connectorConfig={{
          id: '456789',
          display_name: 'Stripe Connector Config',
          connector_name: 'stripe',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          disabled: false,
          org_id: 'org-123',
          metadata: {},
          config: {},
        }}
        status="destructive"
        compact={true}
      />
      <ConnectorConfigTableCell
        connectorConfig={{
          id: '567890',
          display_name: 'GitHub Connector Config',
          connector_name: 'github',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          disabled: false,
          org_id: 'org-123',
          metadata: {},
          config: {},
        }}
        status="healthy"
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

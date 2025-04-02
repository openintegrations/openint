import type {Meta, StoryObj} from '@storybook/react'
import {ConnectionTableCell} from './ConnectionTableCell'
import {CopyID} from './CopyID'

const meta: Meta<typeof ConnectionTableCell> = {
  title: 'Tables/ConnectionTableCell',
  component: ConnectionTableCell,
  tags: ['autodocs'],
  // Define argTypes to control the ConnectionTableCell props
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
      description: 'Status of the connection',
    },
    useIcon: {
      type: 'boolean',
      description: 'Whether to use a link icon instead of initials',
      control: {type: 'boolean'},
    },
  },
} satisfies Meta<typeof ConnectionTableCell>

export default meta
type Story = StoryObj<typeof ConnectionTableCell>

// Default story with all props
export const Default: Story = {
  args: {
    connection: {
      id: '1234567890',
      customer_id: 'cust123',
      connector_config_id: 'config123',
      integration_id: null,
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connector_name: 'salesforce',
      metadata: {name: 'Salesforce Connection'},
      settings: {},
    },
    status: 'healthy',
    simple: false,
    compact: false,
    useIcon: false,
  },
}

// Add variations on the component
export const WithCompactVariant: Story = {
  args: {
    connection: {
      id: '1234567890',
      customer_id: 'cust123',
      connector_config_id: 'config123',
      integration_id: null,
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connector_name: 'salesforce',
      metadata: {name: 'Salesforce Connection'},
      settings: {},
    },
    status: 'healthy',
    simple: false,
    compact: true,
    useIcon: false,
  },
}

export const WithSimpleVariant: Story = {
  args: {
    connection: {
      id: '1234567890',
      customer_id: 'cust123',
      connector_config_id: 'config123',
      integration_id: null,
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connector_name: 'salesforce',
      metadata: {name: 'Salesforce Connection'},
      settings: {},
    },
    status: 'offline',
    simple: true,
    compact: false,
    useIcon: false,
  },
}

export const WithIcon: Story = {
  args: {
    connection: {
      id: '1234567890',
      customer_id: 'cust123',
      connector_config_id: 'config123',
      integration_id: null,
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connector_name: 'salesforce',
      metadata: {name: 'Salesforce Connection'},
      settings: {},
    },
    status: 'warning',
    simple: false,
    compact: false,
    useIcon: true,
  },
}

export const WithDifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectionTableCell
        connection={{
          id: '1234567890',
          customer_id: 'cust123',
          connector_config_id: 'config123',
          integration_id: null,
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connector_name: 'salesforce',
          metadata: {name: 'Salesforce Connection'},
          settings: {},
        }}
        status="healthy"
      />
      <ConnectionTableCell
        connection={{
          id: '9876543210',
          customer_id: 'cust456',
          connector_config_id: 'config456',
          integration_id: null,
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connector_name: 'hubspot',
          metadata: {name: 'HubSpot Connection'},
          settings: {},
        }}
        status="warning"
      />
      <ConnectionTableCell
        connection={{
          id: '5555555555',
          customer_id: 'cust789',
          connector_config_id: 'config789',
          integration_id: null,
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connector_name: 'zendesk',
          metadata: {name: 'Zendesk Connection'},
          settings: {},
        }}
        status="offline"
        simple={true}
      />
      <ConnectionTableCell
        connection={{
          id: '7777777777',
          customer_id: 'cust101',
          connector_config_id: 'config101',
          integration_id: null,
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connector_name: 'stripe',
          metadata: {name: 'Stripe Connection'},
          settings: {},
        }}
        status="destructive"
        compact={true}
      />
      <ConnectionTableCell
        connection={{
          id: '8888888888',
          customer_id: 'cust202',
          connector_config_id: 'config202',
          integration_id: null,
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connector_name: 'github',
          metadata: {name: 'GitHub Connection'},
          settings: {},
        }}
        status="healthy"
        compact={true}
        useIcon={true}
      />
    </div>
  ),
}

export const CopyIDOnly: Story = {
  render: () => (
    <div className="p-4">
      <CopyID value="CONNID_12345678" width={300} size="medium" />
    </div>
  ),
}

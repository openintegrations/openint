import type {Meta, StoryObj} from '@storybook/react'
import type {ConnectionExpanded} from '@openint/api-v1/trpc/routers/connection.models'

import {ConnectionsCardView} from './ConnectionsCardView'

const meta = {
  title: 'Domain Components/ConnectionsCardView',
  component: ConnectionsCardView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectionsCardView>

export default meta
type Story = StoryObj<typeof ConnectionsCardView>

// Mock connection data
const mockConnection: ConnectionExpanded = {
  id: 'conn_123',
  customer_id: 'cust_456',
  connector_config_id: 'config_789',
  connector_name: 'google-drive',
  status: 'healthy',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  disabled: null,
  integration_id: null,
  display_name: null,
}

// Basic usage
export const Default: Story = {
  args: {
    connection: mockConnection,
  },
}

// Connection with disconnected status
export const DisconnectedStatus: Story = {
  args: {
    connection: {
      ...mockConnection,
      status: 'disconnected',
    },
  },
}

// Connection with error status
export const ErrorStatus: Story = {
  args: {
    connection: {
      ...mockConnection,
      status: 'error',
    },
  },
}

// Connection with manual status
export const ManualStatus: Story = {
  args: {
    connection: {
      ...mockConnection,
      status: 'manual',
    },
  },
}

// Connection with non-existent connector (will show fallback)
export const NonExistentConnector: Story = {
  args: {
    connection: {
      ...mockConnection,
      connector_name: 'non-existent-connector',
    },
  },
}

// Multiple connections
export const MultipleConnections: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectionsCardView
        connection={{
          ...mockConnection,
          connector_name: 'plaid',
          status: 'disconnected',
        }}
      />
      <ConnectionsCardView
        connection={{
          ...mockConnection,
          connector_name: 'mercury',
          status: 'error',
        }}
      />
      <ConnectionsCardView
        connection={{
          ...mockConnection,
          connector_name: 'non-existent-connector',
          status: 'manual',
        }}
      />
    </div>
  ),
}

// Story with all variants
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">Default Variants</h3>
        <div className="flex flex-col gap-4">
          <ConnectionsCardView
            connection={{
              ...mockConnection,
              connector_name: 'google-drive',
              status: 'healthy',
            }}
          />
          <ConnectionsCardView
            connection={{
              ...mockConnection,
              connector_name: 'plaid',
              status: 'disconnected',
            }}
          />
          <ConnectionsCardView
            connection={{
              ...mockConnection,
              connector_name: 'mercury',
              status: 'error',
            }}
          />
          <ConnectionsCardView
            connection={{
              ...mockConnection,
              connector_name: 'non-existent-connector',
              status: 'manual',
            }}
          />
        </div>
      </div>
    </div>
  ),
}

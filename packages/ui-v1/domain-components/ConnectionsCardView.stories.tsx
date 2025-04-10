import type {Meta, StoryObj} from '@storybook/react'
import type {Core} from '@openint/api-v1/models'
import {ConnectionCardContent, ConnectionsCardView} from './ConnectionsCardView'

const meta: Meta<typeof ConnectionsCardView> = {
  title: 'DOMAIN COMPONENTS/ConnectionsCardView',
  component: ConnectionsCardView,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    connection: {
      control: 'object',
      description: 'Connection object containing all connection details',
    },
  },
}

// Mock connection object generator
const createMockConnection = (
  id: string,
  customerId: string,
  connectorConfigId: string,
): Core['connection_select'] => {
  const connectorName = id.split('_')[1]
  if (!connectorName) {
    throw new Error('Invalid connection ID')
  }
  return {
    id,
    customer_id: customerId,
    connector_config_id: connectorConfigId,
    created_at: '2023-09-12T12:00:00Z',
    updated_at: '2023-09-12T12:00:00Z',
    display_name: null,
    disabled: false,
    integration_id: null,
    connector_name: connectorName,
    settings: {
      type: 'oauth',
      oauth: {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        expires_at: '2023-09-13T12:00:00Z',
      },
    },
    metadata: null,
  }
}

export default meta
type Story = StoryObj<typeof ConnectionsCardView>

// Basic example
export const Default: Story = {
  args: {
    connection: createMockConnection(
      'conn_salesforce',
      'cust_123',
      'config_123',
    ),
  },
}

// Example with warning status
export const WarningStatus: Story = {
  args: {
    connection: createMockConnection('conn_hubspot', 'cust_456', 'config_456'),
  },
}

// Example with offline status
export const OfflineStatus: Story = {
  args: {
    connection: createMockConnection('conn_stripe', 'cust_789', 'config_789'),
  },
}

// Example with destructive status
export const DestructiveStatus: Story = {
  args: {
    connection: createMockConnection('conn_zapier', 'cust_012', 'config_012'),
  },
}

// Story that just shows the card content
export const CardContent: Story = {
  render: () => (
    <div className="w-[400px]">
      <ConnectionCardContent
        connection={createMockConnection(
          'conn_salesforce',
          'cust_123',
          'config_123',
        )}
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
            connection={createMockConnection(
              'conn_salesforce',
              'cust_123',
              'config_123',
            )}
          />
          <ConnectionsCardView
            connection={createMockConnection(
              'conn_hubspot',
              'cust_456',
              'config_456',
            )}
          />
          <ConnectionsCardView
            connection={createMockConnection(
              'conn_stripe',
              'cust_789',
              'config_789',
            )}
          />
          <ConnectionsCardView
            connection={createMockConnection(
              'conn_zapier',
              'cust_012',
              'config_012',
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">
          With Custom Properties
        </h3>
        <div className="flex flex-col gap-4">
          <ConnectionsCardView
            connection={createMockConnection(
              'conn_salesforce',
              'cust_345',
              'config_345',
            )}
          />
          <ConnectionsCardView
            connection={createMockConnection(
              'conn_hubspot',
              'cust_678',
              'config_678',
            )}
          />
        </div>
      </div>
    </div>
  ),
}

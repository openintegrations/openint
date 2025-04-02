import type {Meta, StoryObj} from '@storybook/react'
import {Button} from '@openint/shadcn/ui'
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
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'The connection status',
    },
    category: {
      control: 'text',
      description: 'Category of the connection',
    },
    platform: {
      control: 'text',
      description: 'Platform of the connection',
    },
    authMethod: {
      control: 'text',
      description: 'Authentication method used',
    },
    version: {
      control: 'text',
      description: 'Version of the API or connector',
    },
  },
}

// Mock connection object generator
const createMockConnection = (
  name: string,
  id: string,
  customerId: string,
  connectorConfigId: string,
) => ({
  id,
  connector_name: 'hubspot',
  customer_id: customerId,
  connector_config_id: connectorConfigId,
  integration_id: null,
  created_at: '2023-09-12T12:00:00Z',
  updated_at: '2023-09-12T12:00:00Z',
  metadata: {name},
  settings: {},
})

export default meta
type Story = StoryObj<typeof ConnectionsCardView>

// Story that just shows the card content
export const CardContent: Story = {
  args: {
    connection: createMockConnection(
      'Hubspot',
      '12345678',
      'CUSTOMERID',
      'CCFGID',
    ),
    status: 'healthy',
    category: 'CRM',
    platform: 'Desktop',
    authMethod: 'oauth',
    version: 'V2',
  },
  render: (args) => (
    <div className="w-[450px] overflow-hidden rounded-md border">
      <ConnectionCardContent {...args} />
    </div>
  ),
}

// Story showing the popover functionality with a custom trigger
export const PopoverFunctionality: Story = {
  args: {
    connection: createMockConnection(
      'Hubspot',
      '12345678',
      'CUSTOMERID',
      'CCFGID',
    ),
    status: 'healthy',
    category: 'CRM',
    platform: 'Desktop',
    authMethod: 'oauth',
    version: 'V2',
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-4 p-12">
      <p className="text-sm text-gray-500">
        Click the button to see the card view
      </p>
      <div className="flex justify-center">
        <ConnectionsCardView {...args}>
          <Button variant="outline">View Connection Details</Button>
        </ConnectionsCardView>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>
          The actual component is designed to work with ConnectionTableCell in
          tables.
        </p>
        <p>Click outside the popover to close it.</p>
      </div>
    </div>
  ),
}

// Examples with different configurations
export const WithDifferentConfigurations: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">CRM Connection</h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            connection={createMockConnection(
              'Hubspot',
              '12345678',
              'CUSTOMERID_123',
              'CCFGID_456',
            )}
            status="healthy"
            category="CRM"
            platform="Desktop"
            authMethod="oauth"
            version="V2"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">Storage Connection</h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            connection={createMockConnection(
              'Google Drive',
              '24681357',
              'CUSTOMERID_123',
              'CCFGID_112',
            )}
            status="offline"
            category="Storage"
            platform="Cloud"
            authMethod="oauth"
            version="V2"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">Support Connection</h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            connection={createMockConnection(
              'Zendesk',
              '13572468',
              'CUSTOMERID_123',
              'CCFGID_131',
            )}
            status="destructive"
            category="Support"
            platform="SaaS"
            authMethod="apikey"
            version="V1"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">
          CRM Connection (Alternative)
        </h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            connection={createMockConnection(
              'Salesforce',
              '87654321',
              'CUSTOMERID_789',
              'CCFGID_101',
            )}
            status="warning"
            category="CRM"
            platform="Web"
            authMethod="oauth"
            version="V3"
          />
        </div>
      </div>
    </div>
  ),
}

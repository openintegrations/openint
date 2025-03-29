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
    name: {
      control: 'text',
      description: 'The connection name',
    },
    id: {
      control: 'text',
      description: 'The connection ID',
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
    customerId: {
      control: 'text',
      description: 'Customer ID associated with connection',
    },
    connectorConfigId: {
      control: 'text',
      description: 'Connector config ID associated with connection',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color for the connection logo',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the connection logo',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectionsCardView>

// Story that just shows the card content
export const CardContent: Story = {
  args: {
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    category: 'CRM',
    platform: 'Desktop',
    authMethod: 'oauth',
    version: 'V2',
    customerId: 'CUSTOMERID',
    connectorConfigId: 'CCFGID',
    backgroundColor: '#F97316',
    textColor: '#FFFFFF',
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
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    category: 'CRM',
    platform: 'Desktop',
    authMethod: 'oauth',
    version: 'V2',
    customerId: 'CUSTOMERID',
    connectorConfigId: 'CCFGID',
    backgroundColor: '#F97316',
    textColor: '#FFFFFF',
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
            name="Hubspot"
            id="12345678"
            status="healthy"
            category="CRM"
            platform="Desktop"
            authMethod="oauth"
            version="V2"
            customerId="CUSTOMERID_123"
            connectorConfigId="CCFGID_456"
            backgroundColor="#F97316"
            textColor="#FFFFFF"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">Storage Connection</h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            name="Google Drive"
            id="24681357"
            status="offline"
            category="Storage"
            platform="Cloud"
            authMethod="oauth"
            version="V2"
            customerId="CUSTOMERID_123"
            connectorConfigId="CCFGID_112"
            backgroundColor="#4285F4"
            textColor="#FFFFFF"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">Support Connection</h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            name="Zendesk"
            id="13572468"
            status="destructive"
            category="Support"
            platform="SaaS"
            authMethod="apikey"
            version="V1"
            customerId="CUSTOMERID_123"
            connectorConfigId="CCFGID_131"
            backgroundColor="#03363D"
            textColor="#FFFFFF"
          />
        </div>
      </div>

      <div className="w-[450px]">
        <h3 className="text-md mb-3 font-medium">
          CRM Connection (Alternative)
        </h3>
        <div className="overflow-hidden rounded-md border">
          <ConnectionCardContent
            name="Salesforce"
            id="87654321"
            status="warning"
            category="CRM"
            platform="Web"
            authMethod="oauth"
            version="V3"
            customerId="CUSTOMERID_789"
            connectorConfigId="CCFGID_101"
            backgroundColor="#00A1E0"
            textColor="#FFFFFF"
          />
        </div>
      </div>
    </div>
  ),
}

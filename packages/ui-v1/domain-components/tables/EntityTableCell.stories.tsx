import type {Meta, StoryObj} from '@storybook/react'
import {EntityTableCell} from './EntityTableCell'

const meta: Meta<typeof EntityTableCell> = {
  title: 'Tables/EntityTableCell',
  component: EntityTableCell,
  tags: ['autodocs'],
  argTypes: {
    entityType: {
      control: 'select',
      options: ['customer', 'connection', 'integration', 'connector-config'],
      description: 'Type of entity to display',
    },
    id: {
      control: 'text',
      description: 'ID of the entity',
    },
    name: {
      control: 'text',
      description: 'Display name of the entity',
    },
    simple: {
      control: 'boolean',
      description: 'Whether to show the simple variant (logo and name only)',
    },
    compact: {
      control: 'boolean',
      description: 'Whether to show the compact variant (just logo and ID)',
    },
    useIcon: {
      control: 'boolean',
      description: 'Whether to use an icon instead of initials',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'destructive', 'offline'],
      description: 'Status of the entity',
    },
  },
}

export default meta
type Story = StoryObj<typeof EntityTableCell>

// Basic example of a customer cell
export const CustomerExample: Story = {
  args: {
    entityType: 'customer',
    id: '12345678',
    name: 'Acme Corporation',
    simple: false,
    compact: false,
    useIcon: false,
    status: 'healthy',
  },
}

// Connection example with icon
export const ConnectionWithIcon: Story = {
  args: {
    entityType: 'connection',
    id: '87654321',
    name: 'Salesforce Connection',
    simple: false,
    compact: false,
    useIcon: true,
    status: 'warning',
  },
}

// Integration example with compact variant
export const IntegrationCompact: Story = {
  args: {
    entityType: 'integration',
    id: '98765432',
    name: 'HubSpot Integration',
    simple: false,
    compact: true,
    useIcon: false,
    status: 'offline',
  },
}

// Connector Config with simple variant
export const ConnectorConfigSimple: Story = {
  args: {
    entityType: 'connector-config',
    id: '12312312',
    name: 'Slack Connector',
    simple: true,
    compact: false,
    useIcon: true,
    status: 'destructive',
  },
}

// All variants displayed together
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">Default Variants</h3>
        <div className="flex flex-col gap-4">
          <EntityTableCell
            entityType="customer"
            id="12345678"
            name="Acme Corporation"
            status="healthy"
          />
          <EntityTableCell
            entityType="connection"
            id="87654321"
            name="Salesforce Connection"
            status="warning"
          />
          <EntityTableCell
            entityType="integration"
            id="98765432"
            name="HubSpot Integration"
            status="offline"
          />
          <EntityTableCell
            entityType="connector-config"
            id="12312312"
            name="Slack Connector"
            status="destructive"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">With Icons</h3>
        <div className="flex flex-col gap-4">
          <EntityTableCell
            entityType="customer"
            id="12345678"
            name="Acme Corporation"
            status="healthy"
            useIcon
          />
          <EntityTableCell
            entityType="connection"
            id="87654321"
            name="Salesforce Connection"
            status="warning"
            useIcon
          />
          <EntityTableCell
            entityType="integration"
            id="98765432"
            name="HubSpot Integration"
            status="offline"
            useIcon
          />
          <EntityTableCell
            entityType="connector-config"
            id="12312312"
            name="Slack Connector"
            status="destructive"
            useIcon
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">Simple Variants</h3>
        <div className="flex flex-col gap-4">
          <EntityTableCell
            entityType="customer"
            id="12345678"
            name="Acme Corporation"
            status="healthy"
            simple
          />
          <EntityTableCell
            entityType="connection"
            id="87654321"
            name="Salesforce Connection"
            status="warning"
            simple
          />
          <EntityTableCell
            entityType="integration"
            id="98765432"
            name="HubSpot Integration"
            status="offline"
            simple
          />
          <EntityTableCell
            entityType="connector-config"
            id="12312312"
            name="Slack Connector"
            status="destructive"
            simple
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-gray-500">Compact Variants</h3>
        <div className="flex flex-col gap-4">
          <EntityTableCell
            entityType="customer"
            id="12345678"
            name="Acme Corporation"
            status="healthy"
            compact
          />
          <EntityTableCell
            entityType="connection"
            id="87654321"
            name="Salesforce Connection"
            status="warning"
            compact
          />
          <EntityTableCell
            entityType="integration"
            id="98765432"
            name="HubSpot Integration"
            status="offline"
            compact
          />
          <EntityTableCell
            entityType="connector-config"
            id="12312312"
            name="Slack Connector"
            status="destructive"
            compact
          />
        </div>
      </div>
    </div>
  ),
}

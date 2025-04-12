import type {Meta, StoryObj} from '@storybook/react'
import type {Core} from '@openint/api-v1/models'

import {EntityTableCell} from './EntityTableCell'

const meta: Meta<typeof EntityTableCell> = {
  title: 'Tables/EntityTableCell',
  component: EntityTableCell,
  tags: ['autodocs'],
  argTypes: {
    entityType: {
      control: 'select',
      options: Object.keys({} as Core),
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
    entityType: 'customer_select',
    id: '12345678',
    name: 'Acme Corporation',
  },
}

// Example with status
export const WithStatus: Story = {
  args: {
    entityType: 'connection_select',
    id: 'conn_123',
    name: 'Production Connection',
    status: 'healthy',
  },
}

// Compact example
export const Compact: Story = {
  args: {
    entityType: 'integration_select',
    id: 'int_456',
    name: 'Salesforce Integration',
    compact: true,
  },
}

// Simple example
export const Simple: Story = {
  args: {
    entityType: 'connector_config_select',
    id: 'config_789',
    name: 'Default Config',
    simple: true,
  },
}

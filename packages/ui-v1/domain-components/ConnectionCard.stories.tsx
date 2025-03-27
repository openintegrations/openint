import type {Meta, StoryObj} from '@storybook/react'
import {ConnectionCard} from './ConnectionCard'

const meta = {
  title: 'UI-V1/Connection/Card',
  component: ConnectionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectionCard>

export default meta
type Story = StoryObj<typeof ConnectionCard>

// Basic ConnectionCard with minimal props
export const Default: Story = {
  args: {
    connection: {
      id: 'conn_123',
      displayName: 'My CRM Connection',
      status: 'healthy',
      labels: ['Production', 'CRM'],
    },
  },
}

// Connection with status message
export const WithStatusMessage: Story = {
  args: {
    connection: {
      id: 'conn_124',
      displayName: 'Sales Database',
      status: 'error',
      statusMessage: 'Authentication token expired',
      labels: ['Sales', 'Database'],
    },
  },
}

// Disconnected state
export const Disconnected: Story = {
  args: {
    connection: {
      id: 'conn_125',
      displayName: 'Marketing Analytics',
      status: 'disconnected',
      statusMessage: 'User action required to reconnect',
      labels: ['Marketing'],
    },
  },
}

// Manual connection
export const Manual: Story = {
  args: {
    connection: {
      id: 'conn_126',
      displayName: 'Manual Data Import',
      status: 'manual',
      labels: ['Import', 'Manual'],
    },
  },
}

// Connection with unknown status
export const UnknownStatus: Story = {
  args: {
    connection: {
      id: 'conn_127',
      displayName: 'Legacy System',
      labels: ['Legacy'],
    },
  },
}

// Connection without display name
export const NoDisplayName: Story = {
  args: {
    connection: {
      id: 'conn_128',
      status: 'healthy',
      labels: ['Unnamed'],
    },
  },
}

// Connection with many labels
export const ManyLabels: Story = {
  args: {
    connection: {
      id: 'conn_129',
      displayName: 'Multi-Purpose Connection',
      status: 'healthy',
      labels: ['Production', 'CRM', 'Sales', 'Marketing', 'Analytics', 'Core'],
    },
  },
}

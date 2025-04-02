import type {Meta, StoryObj} from '@storybook/react'
import {CustomerTableCell} from './CustomerTableCell'

const meta: Meta<typeof CustomerTableCell> = {
  title: 'Tables/CustomerTableCell',
  component: CustomerTableCell,
  tags: ['autodocs'],
  // Define argTypes to control the CustomerTableCell props
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
      description: 'Status of the customer',
    },
    useIcon: {
      type: 'boolean',
      description: 'Whether to use a person icon instead of initials',
      control: {type: 'boolean'},
    },
  },
} satisfies Meta<typeof CustomerTableCell>

export default meta
type Story = StoryObj<typeof CustomerTableCell>

// Default story with all props
export const Default: Story = {
  args: {
    customer: {
      id: '1234567890',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connection_count: 3,
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
    customer: {
      id: '1234567890',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connection_count: 3,
    },
    status: 'healthy',
    simple: false,
    compact: true,
    useIcon: false,
  },
}

export const WithSimpleVariant: Story = {
  args: {
    customer: {
      id: '1234567890',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connection_count: 3,
    },
    status: 'offline',
    simple: true,
    compact: false,
    useIcon: false,
  },
}

export const WithIcon: Story = {
  args: {
    customer: {
      id: '1234567890',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
      connection_count: 3,
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
      <CustomerTableCell
        customer={{
          id: '1234567890',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connection_count: 3,
        }}
        status="healthy"
      />
      <CustomerTableCell
        customer={{
          id: '9876543210',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connection_count: 5,
        }}
        status="warning"
      />
      <CustomerTableCell
        customer={{
          id: '5555555555',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connection_count: 2,
        }}
        status="offline"
        simple={true}
      />
      <CustomerTableCell
        customer={{
          id: '7777777777',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connection_count: 0,
        }}
        status="destructive"
        compact={true}
      />
      <CustomerTableCell
        customer={{
          id: '8888888888',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
          connection_count: 8,
        }}
        status="healthy"
        compact={true}
        useIcon={true}
      />
    </div>
  ),
}

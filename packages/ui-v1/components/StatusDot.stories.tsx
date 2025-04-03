import type {Meta, StoryObj} from '@storybook/react'
import {StatusDot, StatusType} from './StatusDot'

const meta: Meta<typeof StatusDot> = {
  title: 'Components/StatusDot',
  component: StatusDot,
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'The status to display',
    },
    className: {
      control: 'text',
      description: 'Optional class names',
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusDot>

export const Healthy: Story = {
  args: {
    status: 'healthy',
  },
}

export const Warning: Story = {
  args: {
    status: 'warning',
  },
}

export const Offline: Story = {
  args: {
    status: 'offline',
  },
}

export const Destructive: Story = {
  args: {
    status: 'destructive',
  },
}

export const AllStatuses: Story = {
  render: () => {
    const statuses: StatusType[] = [
      'healthy',
      'warning',
      'offline',
      'destructive',
    ]

    return (
      <div className="space-y-4">
        {statuses.map((status) => (
          <div key={status} className="flex items-center gap-2">
            <StatusDot status={status} />
            <span className="text-sm capitalize">{status}</span>
          </div>
        ))}
      </div>
    )
  },
}

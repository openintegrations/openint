import type {Meta, StoryObj} from '@storybook/react'

import {StatusCell} from './StatusCell'

const meta: Meta<typeof StatusCell> = {
  title: 'Components/StatusCell',
  component: StatusCell,
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status to display',
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusCell>

export const Default: Story = {
  args: {
    status: 'healthy',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <StatusCell status="healthy" />
      <StatusCell status="warning" />
      <StatusCell status="offline" />
      <StatusCell status="destructive" />
    </div>
  ),
}

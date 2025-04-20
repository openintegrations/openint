import type {Meta, StoryObj} from '@storybook/react'

import {ConnectionStatusPill} from './ConnectionStatus'

const meta = {
  component: ConnectionStatusPill,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['healthy', 'error', 'disconnected', 'manual'],
      description: 'The status of the connection',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the badge',
    },
  },
} satisfies Meta<typeof ConnectionStatusPill>

export default meta
type Story = StoryObj<typeof meta>

// Healthy status
export const Healthy: Story = {
  args: {status: 'healthy'},
}

// Error status
export const Error: Story = {
  args: {status: 'error'},
}

// Disconnected status
export const Disconnected: Story = {
  args: {status: 'disconnected'},
}

// Manual status
export const Manual: Story = {
  args: {status: 'manual'},
}

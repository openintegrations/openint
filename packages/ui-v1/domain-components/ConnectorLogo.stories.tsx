import type {Meta, StoryObj} from '@storybook/react'

import {ConnectorName} from '@openint/all-connectors/name'
import {ConnectorLogo} from './ConnectorLogo'

const meta = {
  title: 'Domain Components/ConnectorLogo',
  component: ConnectorLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConnectorLogo>

export default meta
type Story = StoryObj<typeof ConnectorLogo>

// Basic usage with default size
export const Default: Story = {
  args: {
    connectorName: 'google-calendar' as ConnectorName,
  },
}

export const Fallback: Story = {
  args: {
    connectorName: 'google-calendar' as any,
    forceFallback: true,
  },
}

// Larger size
export const Large: Story = {
  args: {
    connectorName: 'plaid',
    width: 80,
    height: 80,
  },
}

import type {Meta, StoryObj} from '@storybook/react'

import {FIXTURES} from './__stories__/fixtures'
import {ConnectionCard} from './ConnectionCard'

const meta: Meta<typeof ConnectionCard> = {
  component: ConnectionCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'developer'],
      description: 'The visual variant of the card',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectionCard>

export const Healthy: Story = {
  args: {
    connection: FIXTURES.connections['google-drive-basic'],
  },
}

export const Error: Story = {
  args: {
    connection: {
      ...FIXTURES.connections['google-drive-basic'],
      status: 'error',
    },
  },
}

export const Disconnected: Story = {
  args: {
    connection: {
      ...FIXTURES.connections['google-drive-basic'],
      status: 'disconnected',
    },
  },
}

export const Manual: Story = {
  args: {
    connection: {
      ...FIXTURES.connections['google-drive-basic'],
      status: 'manual',
    },
  },
}

export const NoLogo: Story = {
  args: {
    connection: FIXTURES.connections['google-drive-without-logo'],
  },
}

export const NoIntegration: Story = {
  args: {
    connection: FIXTURES.connections['google-drive-basic'],
  },
}

export const NoIntegrationNoConnector: Story = {
  args: {
    connection: FIXTURES.connections['no-integration-no-connector'],
  },
}

export const Grid: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      {Object.values(FIXTURES.connections).map((connection) => (
        <ConnectionCard key={connection.id} connection={connection} />
      ))}
    </div>
  ),
}

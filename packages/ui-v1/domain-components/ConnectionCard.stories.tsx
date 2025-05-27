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
    onReconnect: () => alert('Reconnect clicked!'),
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

export const WithReconnectButton: Story = {
  args: {
    connection: FIXTURES.connections['notion-basic'],
    onReconnect: () => alert('Reconnecting...'),
  },
}

export const LinearInspiredShowcase: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">
          Healthy Connection
        </h3>
        <ConnectionCard
          connection={FIXTURES.connections['google-drive-basic']}
          onPress={() => {}}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">
          Disconnected (with Reconnect)
        </h3>
        <ConnectionCard
          connection={FIXTURES.connections['notion-basic']}
          onReconnect={() => alert('Reconnecting...')}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">Error State</h3>
        <ConnectionCard
          connection={FIXTURES.connections['hubspot-without-logo']}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">Manual Status</h3>
        <ConnectionCard
          connection={FIXTURES.connections['notion-with-integration']}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Showcase of the Linear-inspired ConnectionCard design with status indicators in the top-left corner and improved Reconnect button styling.',
      },
    },
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

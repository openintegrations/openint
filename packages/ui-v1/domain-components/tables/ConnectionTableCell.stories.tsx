import type {Meta, StoryObj} from '@storybook/react'
import {FIXTURES} from '../__stories__/fixtures'
import {ConnectionTableCell} from './ConnectionTableCell'

const meta: Meta<typeof ConnectionTableCell> = {
  title: 'Tables/ConnectionTableCell',
  component: ConnectionTableCell,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex h-screen w-full items-center justify-center p-8">
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    connection: {
      description: 'Connection object to display',
    },
    useLogo: {
      control: 'boolean',
      description: 'Whether to show the logo',
    },
    logo_url: {
      control: 'text',
      description: 'URL for the logo image',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status of the connection',
    },
    platform: {
      control: 'text',
      description: 'Platform information',
    },
    version: {
      control: 'text',
      description: 'Version information',
    },
    authMethod: {
      control: 'select',
      options: ['oauth', 'apikey'],
      description: 'Authentication method used',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectionTableCell>

export const Default: Story = {
  args: {
    connection: FIXTURES.connections['hubspot-basic'],
    logo_url: '/_assets/logo-greenhouse.svg',
    status: 'healthy',
  },
}

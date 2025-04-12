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
  },
}

export default meta
type Story = StoryObj<typeof ConnectionTableCell>

export const Default: Story = {
  args: {
    connection: FIXTURES.connections['hubspot-basic'],
  },
}

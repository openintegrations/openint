import type {Meta, StoryObj} from '@storybook/react'
import {CopyID} from './CopyID'
import {CustomerTableCell} from './CustomerTableCell'

const meta: Meta<typeof CustomerTableCell> = {
  title: 'Components/CustomerTableCell',
  component: CustomerTableCell,
  argTypes: {
    name: {
      control: 'text',
      description: 'Name of the customer',
    },
    id: {
      control: 'text',
      description: 'ID of the customer',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status of the customer',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color for the logo container',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the initials',
    },
    simple: {
      control: 'boolean',
      description: 'Whether to show the simple variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof CustomerTableCell>

export const Default: Story = {
  args: {
    name: 'Acme Corporation',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#ffedd5',
    textColor: '#ea580c',
  },
}

export const Simple: Story = {
  args: {
    name: 'Acme Corporation',
    status: 'healthy',
    backgroundColor: '#ffedd5',
    textColor: '#ea580c',
    simple: true,
  },
}

export const WithDifferentStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CustomerTableCell
        name="Acme Corporation"
        id="12345678"
        status="healthy"
        backgroundColor="#ffedd5"
        textColor="#ea580c"
      />
      <CustomerTableCell
        name="Globex Corporation"
        id="87654321"
        status="warning"
        backgroundColor="#ffedd5"
        textColor="#ea580c"
      />
      <CustomerTableCell
        name="Initech"
        id="24681357"
        status="offline"
        backgroundColor="#ffedd5"
        textColor="#ea580c"
      />
      <CustomerTableCell
        name="Umbrella Corporation"
        id="13572468"
        status="destructive"
        backgroundColor="#ffedd5"
        textColor="#ea580c"
      />
    </div>
  ),
}

export const CopyIDOnly: Story = {
  render: () => (
    <div className="p-4">
      <CopyID value="CUSID_12345678" width={300} size="medium" />
    </div>
  ),
}

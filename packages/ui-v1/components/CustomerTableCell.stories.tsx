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
    backgroundColor: {
      control: 'color',
      description: 'Background color for the logo container',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the initials or icon',
    },
    simple: {
      control: 'boolean',
      description: 'Whether to show the simple variant',
    },
    compact: {
      control: 'boolean',
      description:
        'Whether to show the compact variant (just logo and ID, no name)',
    },
    useIcon: {
      control: 'boolean',
      description: 'Whether to use a person icon instead of initials',
    },
  },
}

export default meta
type Story = StoryObj<typeof CustomerTableCell>

export const Default: Story = {
  args: {
    name: 'Acme Corporation',
    id: '12345678',
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
  },
}

export const Simple: Story = {
  args: {
    name: 'Acme Corporation',
    id: '12345678',
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
    simple: true,
  },
}

export const WithPersonIcon: Story = {
  args: {
    name: 'Acme Corporation',
    id: '12345678',
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
    useIcon: true,
  },
}

export const Compact: Story = {
  args: {
    name: 'Acme Corporation',
    id: '12345678',
    backgroundColor: '#f3e8ff',
    textColor: '#9333ea',
    compact: true,
    useIcon: true,
  },
}

export const WithDifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CustomerTableCell
        name="Acme Corporation"
        id="12345678"
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
      />
      <CustomerTableCell
        name="Globex Corporation"
        id="87654321"
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
        useIcon={true}
      />
      <CustomerTableCell
        name="Initech"
        id="24681357"
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
        simple={true}
      />
      <CustomerTableCell
        name="Umbrella Corporation"
        id="13572468"
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
        compact={true}
      />
      <CustomerTableCell
        name="Wayne Enterprises"
        id="56789012"
        backgroundColor="#f3e8ff"
        textColor="#9333ea"
        compact={true}
        useIcon={true}
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

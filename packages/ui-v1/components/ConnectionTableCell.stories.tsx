import type {Meta, StoryObj} from '@storybook/react'
import {ConnectionTableCell} from './ConnectionTableCell'
import {CopyID} from './CopyID'

const meta: Meta<typeof ConnectionTableCell> = {
  title: 'Components/ConnectionTableCell',
  component: ConnectionTableCell,
  argTypes: {
    name: {
      control: 'text',
      description: 'Name of the connection',
    },
    id: {
      control: 'text',
      description: 'ID of the connection',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status of the connection',
    },
    backgroundColor: {
      control: 'color',
      description: 'Background color for the logo container',
    },
    simple: {
      control: 'boolean',
      description: 'Whether to show the simple variant',
    },
  },
}

export default meta
type Story = StoryObj<typeof ConnectionTableCell>

export const Default: Story = {
  args: {
    name: 'AWS S3 Connection',
    id: '12345678',
    status: 'healthy',
    backgroundColor: '#f1f5f9',
  },
}

export const Simple: Story = {
  args: {
    name: 'AWS S3 Connection',
    status: 'healthy',
    backgroundColor: '#f1f5f9',
    simple: true,
  },
}

export const WithDifferentStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ConnectionTableCell
        name="AWS S3 Connection"
        id="12345678"
        status="healthy"
        backgroundColor="#f1f5f9"
      />
      <ConnectionTableCell
        name="Google Cloud Storage"
        id="87654321"
        status="warning"
        backgroundColor="#e0f2fe"
      />
      <ConnectionTableCell
        name="Azure Blob Storage"
        id="24681357"
        status="offline"
        backgroundColor="#dbeafe"
      />
      <ConnectionTableCell
        name="DigitalOcean Spaces"
        id="13572468"
        status="destructive"
        backgroundColor="#d1e9dd"
      />
    </div>
  ),
}

export const CopyIDOnly: Story = {
  render: () => (
    <div className="p-4">
      <CopyID value="CONNID_12345678" width={300} size="medium" />
    </div>
  ),
}

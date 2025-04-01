import type {Meta, StoryObj} from '@storybook/react'
import {CopyID} from './CopyID'
import {IntegrationTableCell} from './IntegrationTableCell'

const meta: Meta<typeof IntegrationTableCell> = {
  title: 'Components/IntegrationTableCell',
  component: IntegrationTableCell,
  argTypes: {
    name: {
      control: 'text',
      description: 'Name of the integration',
    },
    id: {
      control: 'text',
      description: 'ID of the integration',
    },
    status: {
      control: 'select',
      options: ['healthy', 'warning', 'offline', 'destructive'],
      description: 'Status of the integration',
    },
    brandColor: {
      control: 'color',
      description: 'Brand color for the logo background',
    },
    textColor: {
      control: 'color',
      description: 'Text color for the initials',
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
      description: 'Whether to use an app icon instead of initials',
    },
  },
}

export default meta
type Story = StoryObj<typeof IntegrationTableCell>

export const Default: Story = {
  args: {
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    brandColor: '#f97316',
    textColor: '#ffffff',
  },
}

export const Simple: Story = {
  args: {
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    brandColor: '#f97316',
    textColor: '#ffffff',
    simple: true,
  },
}

export const WithIcon: Story = {
  args: {
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    brandColor: '#f97316',
    textColor: '#ffffff',
    useIcon: true,
  },
}

export const Compact: Story = {
  args: {
    name: 'Hubspot',
    id: '12345678',
    status: 'healthy',
    brandColor: '#f97316',
    textColor: '#ffffff',
    compact: true,
    useIcon: true,
  },
}

export const WithVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <IntegrationTableCell
        name="Hubspot"
        id="12345678"
        status="healthy"
        brandColor="#f97316"
        textColor="#ffffff"
      />
      <IntegrationTableCell
        name="Salesforce"
        id="87654321"
        status="warning"
        brandColor="#2563eb"
        textColor="#ffffff"
        useIcon={true}
      />
      <IntegrationTableCell
        name="Stripe"
        id="24681357"
        status="offline"
        brandColor="#6366f1"
        textColor="#ffffff"
        simple={true}
      />
      <IntegrationTableCell
        name="Mailchimp"
        id="13572468"
        status="destructive"
        brandColor="#8b5cf6"
        textColor="#ffffff"
        compact={true}
      />
      <IntegrationTableCell
        name="GitHub"
        id="56789012"
        status="healthy"
        brandColor="#27272a"
        textColor="#ffffff"
        compact={true}
        useIcon={true}
      />
    </div>
  ),
}

export const CopyIDOnly: Story = {
  render: () => (
    <div className="p-4">
      <CopyID value="INTID_12345678" width={300} size="medium" />
    </div>
  ),
}

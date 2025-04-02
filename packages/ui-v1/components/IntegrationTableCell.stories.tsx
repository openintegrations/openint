import type {Meta, StoryObj} from '@storybook/react'
import {CopyID} from './CopyID'
import {IntegrationTableCell} from './IntegrationTableCell'

const meta: Meta<typeof IntegrationTableCell> = {
  title: 'Tables/IntegrationTableCell',
  component: IntegrationTableCell,
  tags: ['autodocs'],
  argTypes: {
    compact: {
      type: 'boolean',
      description: 'Whether to show the compact variant (just logo and ID)',
      control: {type: 'boolean'},
    },
    simple: {
      type: 'boolean',
      description: 'Whether to show the simple variant (logo and name only)',
      control: {type: 'boolean'},
    },
    useIcon: {
      type: 'boolean',
      description: 'Whether to use an app icon instead of initials',
      control: {type: 'boolean'},
    },
  },
} satisfies Meta<typeof IntegrationTableCell>

export default meta
type Story = StoryObj<typeof IntegrationTableCell>

export const Default: Story = {
  args: {
    integration: {
      id: '1234567890',
      name: 'Salesforce Integration',
      connector_name: 'salesforce',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
    },
    simple: false,
    compact: false,
    useIcon: false,
  },
}

export const WithCompactVariant: Story = {
  args: {
    integration: {
      id: '1234567890',
      name: 'Salesforce Integration',
      connector_name: 'salesforce',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
    },
    simple: false,
    compact: true,
    useIcon: false,
  },
}

export const WithSimpleVariant: Story = {
  args: {
    integration: {
      id: '1234567890',
      name: 'Salesforce Integration',
      connector_name: 'salesforce',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
    },
    simple: true,
    compact: false,
    useIcon: false,
  },
}

export const WithIcon: Story = {
  args: {
    integration: {
      id: '1234567890',
      name: 'Salesforce Integration',
      connector_name: 'salesforce',
      created_at: '2023-09-12T12:00:00Z',
      updated_at: '2023-09-12T12:00:00Z',
    },
    simple: false,
    compact: false,
    useIcon: true,
  },
}

export const WithDifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <IntegrationTableCell
        integration={{
          id: '1234567890',
          name: 'Salesforce Integration',
          connector_name: 'salesforce',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
        }}
      />
      <IntegrationTableCell
        integration={{
          id: '9876543210',
          name: 'HubSpot Integration',
          connector_name: 'hubspot',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
        }}
      />
      <IntegrationTableCell
        integration={{
          id: '5555555555',
          name: 'Zendesk Integration',
          connector_name: 'zendesk',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
        }}
        simple={true}
      />
      <IntegrationTableCell
        integration={{
          id: '7777777777',
          name: 'Stripe Integration',
          connector_name: 'stripe',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
        }}
        compact={true}
      />
      <IntegrationTableCell
        integration={{
          id: '8888888888',
          name: 'GitHub Integration',
          connector_name: 'github',
          created_at: '2023-09-12T12:00:00Z',
          updated_at: '2023-09-12T12:00:00Z',
        }}
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

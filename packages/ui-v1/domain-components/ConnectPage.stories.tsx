import type {Meta, StoryObj} from '@storybook/react'

import {ConnectPage} from './ConnectPage'

// Mock schema that matches the expected structure from customerRouterSchema
const mockCustomerRouterSchema = {
  createMagicLink: {
    input: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'Customer ID',
        },
        validityInSeconds: {
          type: 'number',
          description: 'Validity in seconds',
          default: 86400, // 24 hours
        },
        displayName: {
          type: 'string',
          description: 'Customer display name',
        },
        redirectUrl: {
          type: 'string',
          description: 'Redirect URL',
        },
        connectorConfigDisplayName: {
          type: 'string',
          description: 'Connector config display name',
        },
        connectorConfigId: {
          type: 'string',
          description: 'Connector config ID',
        },
        connectorNames: {
          type: 'string',
          description: 'Connector names (comma separated)',
        },
        integrationIds: {
          type: 'string',
          description: 'Integration IDs (comma separated)',
        },
        connectionId: {
          type: 'string',
          description: 'Connection ID',
        },
        theme: {
          type: 'string',
          enum: ['light', 'dark', 'system'],
          default: 'light',
          description: 'Theme',
        },
        view: {
          type: 'string',
          enum: ['add', 'manage'],
          default: 'add',
          description: 'View',
        },
        showExisting: {
          type: 'boolean',
          default: false,
          description: 'Show existing',
        },
      },
      required: ['customerId'],
    },
  },
}

const meta = {
  component: ConnectPage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ConnectPage>

export default meta
type Story = StoryObj<typeof ConnectPage>

// Story for ConnectPage
export const MagicLinkPage: Story = {
  args: {
    isMainPreview: false,
    customerRouterSchema: mockCustomerRouterSchema,
  },
}

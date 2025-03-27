import type {Meta, StoryObj} from '@storybook/react'
import {ConnectionPortal} from './ConnectionPortal'
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

// Direct URL logos
const greenhouseLogo =
  'https://cdn.prod.website-files.com/62fe5b9ef9e612fe4fed7ff1/63bf412289101209d218c1b1_g-icon-evergreen.png'
const hubspotLogo = 'https://cdn.worldvectorlogo.com/logos/hubspot-1.svg'

// Mock data for connectors with hardcoded logos - only Greenhouse and Hubspot
const mockConnectorConfigs = [
  // ATS
  {
    id: 'ccfg_greenhouse',
    name: 'greenhouse',
    display_name: 'Greenhouse',
    logo_url: greenhouseLogo,
    category: 'ATS',
  },
  // CRM
  {
    id: 'ccfg_hubspot',
    name: 'hubspot',
    display_name: 'Hubspot',
    logo_url: hubspotLogo,
    category: 'CRM',
  },
]

// Sample mock connections
const mockConnections = [
  {
    id: 'conn_123',
    connectorConfigId: 'ccfg_hubspot',
    connectorConfig: mockConnectorConfigs.find((c) => c.id === 'ccfg_hubspot'),
    customer_id: 'customer_123',
    name: 'My Hubspot',
    created_at: new Date().toISOString(),
  },
  {
    id: 'conn_456',
    connectorConfigId: 'ccfg_greenhouse',
    connectorConfig: mockConnectorConfigs.find(
      (c) => c.id === 'ccfg_greenhouse',
    ),
    customer_id: 'customer_123',
    name: 'Acme Greenhouse',
    created_at: '2023-04-15T10:30:00.000Z',
  },
]

const meta = {
  title: 'UI-V1/ConnectPage/Magic Link and Connection Portal',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta

export default meta

// Story for ConnectPage
export const MagicLinkPage: StoryObj<typeof ConnectPage> = {
  render: () => (
    <ConnectPage
      isMainPreview={false}
      customerRouterSchema={mockCustomerRouterSchema}
    />
  ),
}

// Story for ConnectionPortal - Manage View with connections
export const ConnectionPortal_ManageView: StoryObj = {
  parameters: {
    backgrounds: {default: 'light'},
  },
  render: () => (
    <div
      style={{
        height: '600px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
      }}>
      <ConnectionPortal
        initialView="manage"
        mockConnectorConfigs={mockConnectorConfigs}
        mockConnections={mockConnections}
      />
    </div>
  ),
}

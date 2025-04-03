import type {Meta, StoryObj} from '@storybook/react'
import {ConnectionPortal} from './ConnectionPortal'

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
  component: ConnectionPortal,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ConnectionPortal>

export default meta
type Story = StoryObj<typeof ConnectionPortal>

// Story for ConnectionPortal - Add View (empty state)
export const AddView: Story = {
  args: {
    initialView: 'add',
    mockConnectorConfigs,
    mockConnections: [],
  },
  parameters: {
    backgrounds: {default: 'light'},
  },
  render: (args) => (
    <div
      style={{
        height: '600px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
      }}>
      <ConnectionPortal {...args} />
    </div>
  ),
}

// Story for ConnectionPortal - Manage View with connections
export const ManageView: Story = {
  args: {
    initialView: 'manage',
    mockConnectorConfigs,
    mockConnections,
  },
  parameters: {
    backgrounds: {default: 'light'},
  },
  render: (args) => (
    <div
      style={{
        height: '600px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
      }}>
      <ConnectionPortal {...args} />
    </div>
  ),
}

// Story for ConnectionPortal - Empty State
export const EmptyState: Story = {
  args: {
    initialView: 'manage',
    mockConnectorConfigs,
    mockConnections: [],
  },
  parameters: {
    backgrounds: {default: 'light'},
  },
  render: (args) => (
    <div
      style={{
        height: '600px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '20px',
      }}>
      <ConnectionPortal {...args} />
    </div>
  ),
}

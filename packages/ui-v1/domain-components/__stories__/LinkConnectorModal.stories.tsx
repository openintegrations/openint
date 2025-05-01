import type {Meta, StoryObj} from '@storybook/react'

import {useState} from 'react'
import {Button} from '@openint/shadcn/ui'
import {LinkConnectorModal} from '../LinkConnectorModal'

const meta: Meta<typeof LinkConnectorModal> = {
  title: 'Domain Components/LinkConnectorModal',
  component: LinkConnectorModal,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof LinkConnectorModal>

const connectors = [
  {
    name: 'wise',
    display_name: 'Wise',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-wise-3770198-3155604.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },
  {
    name: 'firebase',
    display_name: 'Firebase',
    logo_url:
      'https://firebase.google.com/static/images/brand-guidelines/logo-logomark.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile'] as Array<'web' | 'mobile' | 'desktop'>,
  },
  {
    name: 'hubspot',
    display_name: 'Hubspot',
    logo_url:
      'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/168_Hubspot_logo_logos-512.png',
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile'] as Array<'web' | 'mobile' | 'desktop'>,
  },
  {
    name: 'ramp',
    display_name: 'Ramp',
    logo_url: 'https://ramp.com/img/logo.png',
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },
  {
    name: 'discord',
    display_name: 'Discord',
    logo_url:
      'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.png',
    stage: 'alpha' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'desktop'] as Array<'web' | 'mobile' | 'desktop'>,
  },
  {
    name: 'gong',
    display_name: 'Gong',
    logo_url:
      'https://www.gong.io/wp-content/themes/gong/assets/images/site-icon-gong.png',
    stage: 'alpha' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as Array<'web' | 'mobile' | 'desktop'>,
  },
]

// Create a larger set of connectors for testing scroll behavior
const manyConnectors = [
  ...connectors,
  // Duplicating existing connectors with slight name variations for testing
  ...connectors.map((connector) => ({
    ...connector,
    name: connector.name, // Keep the same name so ConnectorLogo can find it
    display_name: `${connector.display_name} Pro`,
  })),
  ...connectors.map((connector) => ({
    ...connector,
    name: connector.name, // Keep the same name so ConnectorLogo can find it
    display_name: `${connector.display_name} Team`,
  })),
  ...connectors.map((connector) => ({
    ...connector,
    name: connector.name, // Keep the same name so ConnectorLogo can find it
    display_name: `${connector.display_name} Enterprise`,
  })),
  ...connectors.map((connector) => ({
    ...connector,
    name: connector.name, // Keep the same name so ConnectorLogo can find it
    display_name: `${connector.display_name} Cloud`,
  })),
]

// Controlled Example
const ControlledExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Link Connector Modal</Button>
      <LinkConnectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        connectors={connectors}
        onSelectConnector={(connector) => {
          console.log('Selected connector:', connector)
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export const Default: Story = {
  render: () => <ControlledExample />,
}

export const WithCustomTitle: Story = {
  args: {
    isOpen: true,
    title: 'Choose an Integration',
    connectors: connectors,
  },
}

export const EmptyState: Story = {
  args: {
    isOpen: true,
    connectors: [],
  },
}

// Prefiltered Search Example
const PreFilteredExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [prefilterValue] = useState('disc')

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open with &quot;disc&quot; Search
      </Button>
      <LinkConnectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        connectors={connectors}
        onSelectConnector={(connector) => {
          console.log('Selected connector:', connector)
          setIsOpen(false)
        }}
        initialSearchValue={prefilterValue}
      />
    </div>
  )
}

export const WithSearchPrefiltered: Story = {
  render: () => <PreFilteredExample />,
}

// Add a story with many connectors to test scrolling
const ManyConnectorsExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>
        Open Modal with Many Connectors
      </Button>
      <LinkConnectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        connectors={manyConnectors}
        onSelectConnector={(connector) => {
          console.log('Selected connector:', connector)
          setIsOpen(false)
        }}
      />
    </div>
  )
}

export const WithManyConnectors: Story = {
  render: () => <ManyConnectorsExample />,
}

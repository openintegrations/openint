import type {Meta, StoryObj} from '@storybook/react'
import {ConnectorCard} from '../ConnectorCard'
import {FIXTURES} from './fixtures'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI-V1/ConnectorCard',
  component: ConnectorCard,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof ConnectorCard>

export default meta
type Story = StoryObj<typeof meta>

// Basic ConnectorCard
export const Default: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
  },
}

// ConnectorCard with Beta stage
export const BetaConnector: Story = {
  args: {
    connector: {
      name: 'notion',
      display_name: 'Notion',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
      stage: 'beta',
      platforms: ['web', 'desktop'],
    },
  },
}

// ConnectorCard with Alpha stage
export const AlphaConnector: Story = {
  args: {
    connector: {
      name: 'new-integration',
      display_name: 'New Integration',
      logo_url:
        'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
      stage: 'alpha',
      platforms: ['web'],
    },
  },
}

// ConnectorCard with many platforms
export const ManyPlatforms: Story = {
  args: {
    connector: {
      name: 'hubspot',
      display_name: 'HubSpot',
      logo_url:
        'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/168_Hubspot_logo_logos-512.png',
      stage: 'ga' as 'ga' | 'beta' | 'alpha',
      platforms: ['web', 'mobile', 'desktop'] as (
        | 'web'
        | 'mobile'
        | 'desktop'
      )[],
    },
  },
}

// Multiple cards in a grid
export const CardGrid: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
  },
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[
        {
          name: 'salesforce',
          display_name: 'Salesforce',
          logo_url:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
          stage: 'ga' as 'ga' | 'beta' | 'alpha',
          platforms: ['web', 'mobile', 'desktop'] as (
            | 'web'
            | 'mobile'
            | 'desktop'
          )[],
        },
        {
          name: 'google-drive',
          display_name: 'Google Drive',
          logo_url:
            'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
          stage: 'ga' as 'ga' | 'beta' | 'alpha',
          platforms: ['web', 'mobile', 'desktop'] as (
            | 'web'
            | 'mobile'
            | 'desktop'
          )[],
        },
        {
          name: 'hubspot',
          display_name: 'HubSpot',
          logo_url:
            'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/168_Hubspot_logo_logos-512.png',
          stage: 'beta' as 'ga' | 'beta' | 'alpha',
          platforms: ['web', 'mobile'] as ('web' | 'mobile' | 'desktop')[],
        },
        {
          name: 'notion',
          display_name: 'Notion',
          logo_url:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Notion-logo.svg/2048px-Notion-logo.svg.png',
          stage: 'alpha' as 'ga' | 'beta' | 'alpha',
          platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
        },
      ].map((connector, index) => (
        <ConnectorCard key={index} connector={connector} />
      ))}
    </div>
  ),
}

// Responsive grid demonstration
export const ResponsiveGrid: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
  },
  render: () => (
    <div className="w-full max-w-4xl">
      <h3 className="mb-4 text-lg font-semibold">Responsive Grid Layout</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.values(FIXTURES.connectors).map((connector, index) => (
          <ConnectorCard key={index} connector={connector} />
        ))}
      </div>
    </div>
  ),
}

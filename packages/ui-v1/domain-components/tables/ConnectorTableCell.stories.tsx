import type {Meta, StoryObj} from '@storybook/react'
import {ConnectorTableCell} from './ConnectorTableCell'

const meta = {
  title: 'DOMAIN COMPONENTS/ConnectorTableCell',
  component: ConnectorTableCell,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ConnectorTableCell>

export default meta
type Story = StoryObj<typeof meta>

// Basic ConnectorTableCell
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

// ConnectorTableCell with Beta stage
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

// ConnectorTableCell with Alpha stage
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

// ConnectorTableCell without stage badge
export const WithoutStage: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
    showStage: false,
  },
}

// ConnectorTableCell without platform badges
export const WithoutPlatforms: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
    showPlatforms: false,
  },
}

// ConnectorTableCell without any badges
export const WithoutBadges: Story = {
  args: {
    connector: {
      name: 'salesforce',
      display_name: 'Salesforce',
      logo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
    showStage: false,
    showPlatforms: false,
  },
}

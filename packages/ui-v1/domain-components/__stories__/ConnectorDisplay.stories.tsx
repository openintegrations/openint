import type {Meta, StoryObj} from '@storybook/react'

import {Badge} from '@openint/shadcn/ui'
import {ConnectorDisplay} from '../ConnectorDisplay'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: ConnectorDisplay,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['card', 'row'],
      description: 'The layout mode of the connector display',
    },
  },
} satisfies Meta<typeof ConnectorDisplay>

export default meta
type Story = StoryObj<typeof meta>

// Basic ConnectorDisplay
export const Default: Story = {
  args: {
    connector: {
      name: 'google-drive',
      display_name: 'Google Drive',
      logo_url:
        'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
  },
}

// Row mode ConnectorDisplay
export const RowMode: Story = {
  args: {
    connector: {
      name: 'google-drive',
      display_name: 'Google Drive',
      logo_url:
        'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
    mode: 'row',
  },
  parameters: {
    layout: 'padded',
  },
}

// Table Cell variant - horizontal layout for tables
export const TableCell: Story = {
  args: {
    connector: {
      name: 'google-drive',
      display_name: 'Google Drive',
      logo_url:
        'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
      stage: 'ga',
      platforms: ['web', 'mobile', 'desktop'],
    },
  },
  render: (args) => {
    const connector = args.connector

    return (
      <div className="w-full max-w-md">
        {/* Simple horizontal cell format */}
        <div className="flex items-center gap-3 p-3">
          <img
            src={connector.logo_url}
            alt={`${connector.display_name} logo`}
            className="h-8 w-8 flex-shrink-0 rounded-xl object-contain"
          />
          <div className="flex-1">
            <p className="font-medium">{connector.display_name}</p>
          </div>
          <Badge
            variant={connector.stage === 'ga' ? 'default' : 'secondary'}
            className={
              connector.stage === 'ga'
                ? 'bg-green-100 text-green-800'
                : connector.stage === 'beta'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-pink-100 text-pink-800'
            }>
            {connector.stage?.toUpperCase() || ''}
          </Badge>
        </div>
      </div>
    )
  },
}

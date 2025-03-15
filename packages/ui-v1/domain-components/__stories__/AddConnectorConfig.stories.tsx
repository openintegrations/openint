import type {Meta, StoryObj} from '@storybook/react'
import {Badge} from '@openint/shadcn/ui'
import {AddConnectorConfig} from '../AddConnectorConfig'

// Enhanced connector card with category and auth badges
const ConnectorCardWithBadges = ({connector}: {connector: any}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <img
          src={connector.logo_url}
          alt={`${connector.display_name} logo`}
          className="h-12 w-12 object-contain"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">{connector.display_name}</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {connector.category && (
              <Badge variant="outline" className="bg-gray-50">
                {connector.category}
              </Badge>
            )}
            {connector.auth_type && (
              <Badge variant="outline" className="bg-gray-50">
                {connector.auth_type}
              </Badge>
            )}
            {connector.stage === 'ga' && (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                GA
              </Badge>
            )}
            {connector.stage === 'beta' && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                Beta
              </Badge>
            )}
            {connector.version && (
              <Badge
                variant="outline"
                className="border-red-200 bg-red-50 text-red-800">
                {connector.version}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sample connector data
const SAMPLE_CONNECTORS = [
  {
    name: 'salesforce',
    display_name: 'Salesforce',
    logo_url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/1280px-Salesforce.com_logo.svg.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as ('web' | 'mobile' | 'desktop')[],
    category: 'CRM',
    auth_type: 'oauth2',
    version: 'V2',
  },
  {
    name: 'google-drive',
    display_name: 'Google Drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile', 'desktop'] as ('web' | 'mobile' | 'desktop')[],
    category: 'File Storage',
    auth_type: 'oauth2',
    version: 'V3',
  },
  {
    name: 'google-drive-beta',
    display_name: 'Google Drive',
    logo_url:
      'https://cdn.iconscout.com/icon/free/png-256/free-google-drive-logo-icon-download-in-svg-png-gif-file-formats--storage-social-media-pack-logos-icons-1718511.png?f=webp&w=256',
    stage: 'beta' as 'ga' | 'beta' | 'alpha',
    platforms: ['web', 'mobile'] as ('web' | 'mobile' | 'desktop')[],
    category: 'File Storage',
    auth_type: 'oauth2',
    version: 'V2',
  },
  {
    name: 'plaid',
    display_name: 'Plaid',
    logo_url:
      'https://cdn.icon-icons.com/icons2/2699/PNG/512/plaid_logo_icon_168102.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    category: 'Banking',
    auth_type: 'aggregator',
    version: 'V2',
  },
  {
    name: 'cal-com',
    display_name: 'Cal.com',
    logo_url: 'https://cal.com/android-chrome-512x512.png',
    stage: 'ga' as 'ga' | 'beta' | 'alpha',
    platforms: ['web'] as ('web' | 'mobile' | 'desktop')[],
    category: 'Scheduling',
    auth_type: 'apikey',
    version: 'V1',
  },
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'UI-V1 /AddConnectorConfig',
  component: AddConnectorConfig,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: {action: 'closed'},
    onSelectConnector: {action: 'connector selected'},
    variant: {
      control: 'select',
      options: ['default', 'modal'],
      description:
        'Display variant - default (page view) or modal (with shadow and rounded corners)',
    },
  },
} satisfies Meta<typeof AddConnectorConfig>

export default meta
type Story = StoryObj<typeof meta>

// Default story - Page view
export const Default: Story = {
  args: {
    connectors: SAMPLE_CONNECTORS,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default page view without modal styling, suitable for embedding in a page layout.',
      },
    },
  },
}

// Modal variant
export const ModalVariant: Story = {
  args: {
    connectors: SAMPLE_CONNECTORS,
    variant: 'modal',
    onClose: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal/sheet variant with shadow and rounded corners, suitable for dialogs.',
      },
    },
  },
}

// With search query
export const WithSearchQuery: Story = {
  args: {
    connectors: SAMPLE_CONNECTORS,
  },
  play: async ({canvasElement}) => {
    const canvas = canvasElement as HTMLElement
    const searchInput = canvas.querySelector(
      'input[type="text"]',
    ) as HTMLInputElement
    if (searchInput) {
      searchInput.value = 'google'
      searchInput.dispatchEvent(new Event('input', {bubbles: true}))
    }
  },
}

// Just the connector cards with badges (matching the image)
export const ConnectorCardsWithBadges: Story = {
  render: () => (
    <div className="max-w-xl rounded-lg border border-gray-200 p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SAMPLE_CONNECTORS.map((connector, index) => (
          <div
            key={index}
            className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:bg-gray-50">
            <ConnectorCardWithBadges connector={connector} />
          </div>
        ))}
      </div>
    </div>
  ),
  args: {
    connectors: SAMPLE_CONNECTORS,
  },
}

// Empty state
export const EmptyState: Story = {
  args: {
    connectors: [],
  },
}

// Mobile view
export const MobileView: Story = {
  args: {
    connectors: SAMPLE_CONNECTORS,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

// Page layout example
export const PageLayoutExample: Story = {
  args: {
    connectors: SAMPLE_CONNECTORS,
  },
  render: () => (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white p-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-bold">OpenInt Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Settings
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-500"></div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Connectors</h2>
            <p className="text-gray-600">
              Browse and add connector configurations
            </p>
          </div>

          {/* AddConnectorConfig embedded in page */}
          <div className="rounded-lg border border-gray-200 bg-white">
            <AddConnectorConfig
              connectors={SAMPLE_CONNECTORS}
              variant="default"
              onSelectConnector={(connector) =>
                console.log('Selected:', connector)
              }
            />
          </div>
        </div>
      </main>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Example of AddConnectorConfig embedded in a page layout.',
      },
    },
  },
}

/* eslint-disable react-hooks/rules-of-hooks */
import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@openint/shadcn/ui'
import {FIXTURES} from './__stories__/fixtures'
import {AddConnectorConfig} from './AddConnectorConfig'

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
  args: {connectors: FIXTURES.connectorsList},
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
    connectors: FIXTURES.connectorsList,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal/sheet variant with shadow and rounded corners, suitable for dialogs.',
      },
    },
  },
  render: (props) => {
    // Add state for sheet open/close
    const [open, setOpen] = React.useState(true)
    // In a real implementation, we would handle onClose to set open=false
    return (
      <>
        <Button onClick={() => setOpen(true)} variant="default">
          Open Connector Panel
        </Button>
        <Sheet open={open} onOpenChange={setOpen} modal={true}>
          <SheetContent side="right" className="w-[700px] sm:max-w-full">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold">
                Add Connector
              </SheetTitle>
            </SheetHeader>
            <AddConnectorConfig {...props} />
          </SheetContent>
        </Sheet>
      </>
    )
  },
}

// With search query
export const WithSearchQuery: Story = {
  args: {
    connectors: FIXTURES.connectorsList,
    initialSearchQuery: 'google',
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
    connectors: FIXTURES.connectorsList,
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
    connectors: FIXTURES.connectorsList,
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
              connectors={FIXTURES.connectorsList}
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

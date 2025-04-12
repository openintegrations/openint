import type {Meta, StoryObj} from '@storybook/react'

import {CopyID} from './CopyID'
import {PropertyListView} from './PropertyListView'

const meta: Meta<typeof PropertyListView> = {
  title: 'Components/PropertyListView',
  component: PropertyListView,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof PropertyListView>

export const Default: Story = {
  args: {
    properties: [
      {title: 'Category', value: 'CRM'},
      {title: 'Platform', value: 'Desktop'},
      {title: 'Auth Method', value: 'oauth'},
      {title: 'Version', value: 'V2'},
    ],
  },
  render: (args) => (
    <div className="w-[500px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <PropertyListView {...args} />
    </div>
  ),
}

export const WithCopyID: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <PropertyListView
        properties={[
          {title: 'Category', value: 'CRM'},
          {title: 'Platform', value: 'Desktop'},
          {title: 'Auth Method', value: 'oauth'},
          {title: 'Version', value: 'V2'},
          {
            title: 'CustomerID',
            value: <CopyID value="CUSTOMERID" width="100%" size="compact" />,
            isCopyID: true,
          },
          {
            title: 'ConnectorConfigID',
            value: <CopyID value="CCFGID" width="100%" size="compact" />,
            isCopyID: true,
          },
        ]}
      />
    </div>
  ),
}

export const WithCustomStyling: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <PropertyListView
        className="space-y-6"
        properties={[
          {
            title: 'Category',
            value: <span className="font-semibold text-blue-600">CRM</span>,
          },
          {
            title: 'Platform',
            value: <span className="font-semibold text-blue-600">Desktop</span>,
          },
          {
            title: 'Auth Method',
            value: <span className="font-semibold text-blue-600">oauth</span>,
          },
          {
            title: 'Version',
            value: <span className="font-semibold text-blue-600">V2</span>,
          },
        ]}
      />
    </div>
  ),
}

export const WithDifferentSizes: Story = {
  render: () => (
    <div className="w-[500px] rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <PropertyListView
        properties={[
          {
            title: 'Default (Medium)',
            value: <CopyID value="CUSTOMERID_DEFAULT" width="100%" />,
            isCopyID: true,
          },
          {
            title: 'Medium Size (Explicit)',
            value: (
              <CopyID value="CUSTOMERID_MEDIUM" width="100%" size="medium" />
            ),
            isCopyID: true,
          },
          {
            title: 'Large Size',
            value: (
              <CopyID value="CUSTOMERID_LARGE" width="100%" size="default" />
            ),
            isCopyID: true,
          },
          {
            title: 'Compact Size',
            value: (
              <CopyID value="CUSTOMERID_COMPACT" width="100%" size="compact" />
            ),
            isCopyID: true,
          },
          {title: 'Regular Text', value: 'This is regular text without CopyID'},
        ]}
      />
    </div>
  ),
}

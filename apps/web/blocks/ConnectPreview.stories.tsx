import type {Meta, StoryObj} from '@openint/ui-v1/storybook'
import {ConnectPreview} from './ConnectPreview'

const meta = {
  component: ConnectPreview,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    // Add any props that the component accepts
  },
} satisfies Meta<typeof ConnectPreview>

export default meta
type Story = StoryObj<typeof meta>

// Default story with no props
export const Default: Story = {
  args: {},
}

// Story with custom height
export const CustomHeight: Story = {
  args: {},
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'desktop',
    },
  },
  decorators: [
    (Story) => (
      <div className="h-[800px]">
        <Story />
      </div>
    ),
  ],
}

// Story with mobile viewport
export const MobileView: Story = {
  args: {},
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

// Story with tablet viewport
export const TabletView: Story = {
  args: {},
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'tablet',
    },
  },
}

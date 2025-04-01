import type {Meta, StoryObj} from '@storybook/react'
import {BrowserWindow, MobileScreen, TabletScreen} from './PreviewWindow'

const meta = {
  title: 'Components/PreviewWindow',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ExampleContent = () => (
  <div className="p-8">
    <h1 className="mb-4 text-2xl font-bold">Welcome to Device Preview</h1>
    <p className="text-muted-foreground mb-4">
      This is an example of how content looks in different device previews.
    </p>
    <div className="grid gap-4">
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-semibold">Section 1</h2>
        <p className="text-muted-foreground">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>
      <div className="rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-semibold">Section 2</h2>
        <p className="text-muted-foreground">
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    </div>
  </div>
)

export const Desktop: Story = {
  render: () => (
    <BrowserWindow>
      <ExampleContent />
    </BrowserWindow>
  ),
}

export const DesktopLoading: Story = {
  render: () => (
    <BrowserWindow isLoading url="https://openint.dev">
      <ExampleContent />
    </BrowserWindow>
  ),
}

export const Mobile: Story = {
  render: () => (
    <MobileScreen>
      <ExampleContent />
    </MobileScreen>
  ),
}

export const MobileLoading: Story = {
  render: () => (
    <MobileScreen isLoading url="https://openint.dev/docs">
      <ExampleContent />
    </MobileScreen>
  ),
}

export const Tablet: Story = {
  render: () => (
    <TabletScreen>
      <ExampleContent />
    </TabletScreen>
  ),
}

export const TabletLoading: Story = {
  render: () => (
    <TabletScreen isLoading url="https://openint.dev/dashboard">
      <ExampleContent />
    </TabletScreen>
  ),
}

export const AllDevices: Story = {
  render: () => (
    <div className="flex items-start gap-8 p-8">
      <BrowserWindow className="w-[800px]">
        <ExampleContent />
      </BrowserWindow>
      <TabletScreen>
        <ExampleContent />
      </TabletScreen>
      <MobileScreen>
        <ExampleContent />
      </MobileScreen>
    </div>
  ),
}

import type {Meta, StoryObj} from '@storybook/react'
import {PreviewWindow} from './PreviewWindow'

const meta = {
  component: PreviewWindow,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    isLoading: {
      control: 'boolean',
      description: 'Shows loading spinner in URL bar',
      defaultValue: false,
    },
  },
} satisfies Meta<typeof PreviewWindow>

export default meta
type Story = StoryObj<typeof meta>

const content = (
  <div className="bg-muted/50 flex h-full items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Preview Window</h1>
      <p className="text-muted-foreground mt-2">
        This content adapts to different device views
      </p>
    </div>
  </div>
)

export const Default: Story = {
  args: {
    children: content,
  },
}

export const CustomHeight: Story = {
  args: {
    children: content,
    className: 'h-[600px]',
  },
}

export const Loading: Story = {
  args: {
    children: content,
    isLoading: true,
  },
}

export const MobileDefault: Story = {
  args: {
    children: content,
    defaultView: 'Mobile',
  },
}

export const TabletDefault: Story = {
  args: {
    children: content,
    defaultView: 'Embedded',
  },
}

export const MagicLinkDefault: Story = {
  args: {
    children: content,
    defaultView: 'Magic Link',
  },
}

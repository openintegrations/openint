// packages/shadcn/__stories__/separator.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'
import React from 'react'
import {Separator} from '../ui/separator'

const meta = {
  title: 'Shadcn/Separator',
  component: Separator,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the separator',
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium leading-none">
          Horizontal Separator
        </h4>
        <p className="text-muted-foreground text-sm">
          A line that separates content horizontally.
        </p>
      </div>
      <Separator {...args} />
      <div className="pt-4">
        <p className="text-sm">Content below the separator.</p>
      </div>
    </div>
  ),
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-40 items-center">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Left Content</h4>
        <p className="text-muted-foreground text-sm">
          Content on the left side.
        </p>
      </div>
      <Separator {...args} className="mx-6 h-full" />
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">Right Content</h4>
        <p className="text-muted-foreground text-sm">
          Content on the right side.
        </p>
      </div>
    </div>
  ),
}

export const InMenu: Story = {
  render: () => (
    <div className="w-60 rounded-md border p-4">
      <div className="space-y-1 py-2">
        <h4 className="text-sm font-semibold">Menu Item 1</h4>
        <p className="text-muted-foreground text-sm">Description for item 1</p>
      </div>
      <Separator className="my-2" />
      <div className="space-y-1 py-2">
        <h4 className="text-sm font-semibold">Menu Item 2</h4>
        <p className="text-muted-foreground text-sm">Description for item 2</p>
      </div>
      <Separator className="my-2" />
      <div className="space-y-1 py-2">
        <h4 className="text-sm font-semibold">Menu Item 3</h4>
        <p className="text-muted-foreground text-sm">Description for item 3</p>
      </div>
    </div>
  ),
}

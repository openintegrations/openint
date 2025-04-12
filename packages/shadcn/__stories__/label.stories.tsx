// packages/shadcn/__stories__/label.stories.tsx
import type {Meta, StoryObj} from '@storybook/react'

import {Checkbox} from '../ui/checkbox'
import {Input} from '../ui/input'
import {Label} from '../ui/label'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  component: Label,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

// Basic Label
export const Default: Story = {
  render: () => <Label>Email address</Label>,
}

// Label with Input
export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
}

// Label with Checkbox
export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
}

// Required Label
export const Required: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label
        htmlFor="username"
        className="after:text-red-500 after:content-['*']">
        Username
      </Label>
      <Input id="username" placeholder="Username" required />
    </div>
  ),
}

// Disabled Label
export const Disabled: Story = {
  render: () => (
    <div
      className="grid w-full max-w-sm items-center gap-1.5"
      data-disabled="true">
      <Label htmlFor="disabled-input">Disabled Field</Label>
      <Input id="disabled-input" disabled placeholder="Disabled input" />
    </div>
  ),
}

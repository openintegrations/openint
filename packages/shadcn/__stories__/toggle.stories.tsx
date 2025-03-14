import type {Meta, StoryObj} from '@storybook/react'
import {BoldIcon, ItalicIcon, UnderlineIcon} from 'lucide-react'
import {Toggle} from '../ui/toggle'

const meta = {
  title: 'Shadcn/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof Toggle>

export default meta
type Story = StoryObj<typeof meta>

// Default Toggle
export const Default: Story = {
  args: {
    'aria-label': 'Toggle bold',
    children: 'Bold',
  },
  render: (args) => <Toggle {...args} />,
}

// With Icon
export const WithIcon: Story = {
  args: {
    'aria-label': 'Toggle bold',
  },
  render: (args) => (
    <Toggle {...args}>
      <BoldIcon className="h-4 w-4" />
      <span>Bold</span>
    </Toggle>
  ),
}

// Icon Only
export const IconOnly: Story = {
  args: {
    'aria-label': 'Toggle italic',
  },
  render: (args) => (
    <Toggle {...args}>
      <ItalicIcon className="h-4 w-4" />
    </Toggle>
  ),
}

// Outline Variant
export const Outline: Story = {
  args: {
    variant: 'outline',
    'aria-label': 'Toggle underline',
  },
  render: (args) => (
    <Toggle {...args}>
      <UnderlineIcon className="h-4 w-4" />
      <span>Underline</span>
    </Toggle>
  ),
}

// Small Size
export const Small: Story = {
  args: {
    size: 'sm',
    'aria-label': 'Toggle bold',
  },
  render: (args) => (
    <Toggle {...args}>
      <BoldIcon className="h-3 w-3" />
      <span>Bold</span>
    </Toggle>
  ),
}

// Large Size
export const Large: Story = {
  args: {
    size: 'lg',
    'aria-label': 'Toggle bold',
  },
  render: (args) => (
    <Toggle {...args}>
      <BoldIcon className="h-5 w-5" />
      <span>Bold</span>
    </Toggle>
  ),
}

// Toggle Group
export const ToggleGroup: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Toggle aria-label="Toggle bold">
        <BoldIcon className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle italic">
        <ItalicIcon className="h-4 w-4" />
      </Toggle>
      <Toggle aria-label="Toggle underline">
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
    </div>
  ),
}

// Disabled Toggle
export const Disabled: Story = {
  args: {
    'aria-label': 'Toggle bold',
    disabled: true,
  },
  render: (args) => (
    <Toggle {...args}>
      <BoldIcon className="h-4 w-4" />
      <span>Bold</span>
    </Toggle>
  ),
}

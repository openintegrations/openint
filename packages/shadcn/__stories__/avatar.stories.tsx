import type {Meta, StoryObj} from '@storybook/react'
import {Avatar, AvatarFallback, AvatarImage} from '../ui/avatar'

const meta = {
  title: 'Shadcn/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

// Default Avatar with Image
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
}

// Avatar with Fallback
export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="@johndoe" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
}

// Avatar Sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar className="h-6 w-6">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="h-12 w-12">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="h-16 w-16">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
  ),
}

// Colored Fallbacks
export const ColoredFallbacks: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Avatar>
        <AvatarFallback className="bg-primary text-primary-foreground">
          CN
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-secondary text-secondary-foreground">
          JD
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-destructive text-destructive-foreground">
          AB
        </AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-accent text-accent-foreground">
          XY
        </AvatarFallback>
      </Avatar>
    </div>
  ),
}

// Avatar Group
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-background border-2">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback className="bg-secondary">JD</AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback className="bg-primary text-primary-foreground">
          AB
        </AvatarFallback>
      </Avatar>
      <Avatar className="border-background border-2">
        <AvatarFallback className="bg-muted">+3</AvatarFallback>
      </Avatar>
    </div>
  ),
}

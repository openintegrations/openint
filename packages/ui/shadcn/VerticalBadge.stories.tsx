import type { Meta, StoryObj } from '@storybook/react'
import VerticalBadge from './VerticalBadge'
import { VERTICAL_BY_KEY } from '@openint/cdk'

const meta = {
  title: 'UI/Badges/VerticalBadge',
  component: VerticalBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    vertical: {
      control: 'select',
      options: Object.keys(VERTICAL_BY_KEY),
    },
  },
  args: {
    vertical: 'commerce',
  },
} satisfies Meta<typeof VerticalBadge>

export default meta
type Story = StoryObj<typeof meta>

// Create a default story
export const Default: Story = {
  args: {
    vertical: 'commerce',
  },
}


// TODO: see how to dynamically create stories for each vertical
// const stories: Record<string, Story> = {}
// Object.entries(VERTICAL_BY_KEY).forEach(([key, vertical]) => {
//   // Convert kebab-case to PascalCase for the story name
//   stories[key] = {
//     args: {
//       vertical: vertical.key,
//     },
//   }
// })

// // Export all the dynamically created stories
// Object.entries(stories).forEach(([name, story]) => {
//   exports[name] = story
// }) 

export const Crm: Story = {
  args: {
    vertical: 'crm',
  },
}

export const Hris: Story = {
  args: {
    vertical: 'hris',
  },
}

export const Banking: Story = {
  args: {
    vertical: 'banking',
  },
}

export const FileStorage: Story = {
  args: {
    vertical: 'file-storage',
  },
}
import type {Meta, StoryObj} from '@storybook/react'
import {VERTICAL_BY_KEY, VerticalKey} from '@openint/cdk'
import VerticalBadge from '../components/VerticalBadge'

// Define the component props interface to match the component
interface VerticalBadgeProps {
  vertical: VerticalKey
  className?: string
}

// Use the correct type annotation
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
    vertical: 'commerce' as VerticalKey,
  },
} as Meta<VerticalBadgeProps>

export default meta
type Story = StoryObj<typeof meta>

// Create a default story
export const Default: Story = {
  args: {
    vertical: 'commerce' as VerticalKey,
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
    vertical: 'crm' as VerticalKey,
  },
}

export const Hris: Story = {
  args: {
    vertical: 'hris' as VerticalKey,
  },
}

export const Banking: Story = {
  args: {
    vertical: 'banking' as VerticalKey,
  },
}

export const FileStorage: Story = {
  args: {
    vertical: 'file-storage' as VerticalKey,
  },
}

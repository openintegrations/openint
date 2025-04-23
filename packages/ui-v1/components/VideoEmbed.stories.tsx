import type {Meta, StoryObj} from '@storybook/react'

import {VideoEmbed} from './VideoEmbed'

const meta: Meta<typeof VideoEmbed> = {
  title: 'Components/VideoEmbed',
  component: VideoEmbed,
  parameters: {
    // Optional parameters for the story
    layout: 'centered',
  },
  tags: ['autodocs'], // Enable automatic documentation
  argTypes: {
    // Define control types for props if needed
    videoId: {control: 'text'},
    title: {control: 'text'},
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Default story with a placeholder video ID
export const Default: Story = {
  args: {
    videoId: 'FpG7otZZhRw',
    title: 'Sample YouTube Video',
  },
}

// Example with a different video
export const AnotherVideo: Story = {
  args: {
    videoId: 'QH2-dQw4w9WgXcQ',
    title: 'Big Buck Bunny',
  },
}

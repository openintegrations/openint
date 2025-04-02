import type {Meta, StoryObj} from '@storybook/react'
import {FullScreenCenter} from './FullScreenCenter'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Web/FullScreenCenter',
  component: FullScreenCenter,
} satisfies Meta<typeof FullScreenCenter>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    children: 'Content',
  },
}

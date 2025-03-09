import type {Meta, StoryObj} from '@storybook/react'
import {fn} from '@storybook/test'
import StatusBadge from './StatusBadge'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'StatusBadge',
  component: StatusBadge,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {onClick: fn()},
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Success: Story = {
  args: {status: 'success'},
}

export const Error: Story = {
  args: {status: 'error'},
}

// Not working yet

// const stories = Object.fromEntries(
//   (['success', 'error'] as const).map((status) => {
//     const Story: Story = {
//       args: {status},
//     }
//     return [status, Story]
//   }),
// )

// export const Success2 = stories['success']

// module.exports = stories

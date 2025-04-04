import type {Meta, StoryObj} from '@storybook/react'
import {Loader2} from 'lucide-react'

export function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="text-button size-7 animate-spin" />
    </div>
  )
}

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomSize: Story = {
  decorators: [
    (Story) => (
      <div className="h-[200px] w-[200px]">
        <Story />
      </div>
    ),
  ],
}

import type {Meta, StoryObj} from '@storybook/react'
import {SidebarProvider} from '@openint/shadcn/ui/sidebar'
import {AppHeader} from './app-header'

const meta = {
  // TODO: Setup title to be inferred
  title: 'Components/Navigation/AppHeader',
  component: AppHeader,
  parameters: {layout: 'fullscreen'},
  decorators: [
    (Story) => (
      <SidebarProvider>
        <div className="w-full bg-amber-50">
          <Story />
        </div>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {userButton: <DummyUserButton />},
}

export function DummyUserButton() {
  return (
    <div className="ml-auto">
      <span className="text-sm font-medium text-gray-900">User Button</span>
    </div>
  )
}

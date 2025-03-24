import type {Meta, StoryObj} from '@storybook/react'
import {DummyUserButton} from './app-header.stories'
import {AppLayout} from './app-layout'
import {DummyOrganizationSwitcher} from './app-sidebar.stories'

const meta = {
  title: 'UI-V1/Navigation/AppLayout',
  component: AppLayout,
} satisfies Meta<typeof AppLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    organizationSwitcher: <DummyOrganizationSwitcher />,
    userButton: <DummyUserButton />,
    children: (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
          <div className="bg-muted/50 aspect-video rounded-xl" />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    ),
  },
}

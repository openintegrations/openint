import type {Meta, StoryObj} from '@storybook/react'
import type {CommandDefinitionMap} from '@openint/commands'

import {toast, Toaster} from 'sonner'
import {
  CommandBar,
  CommandButton,
  CommandInline,
  CommandPopover,
} from './command-components'

const navCommands = {
  go_to_connect: {
    icon: 'Wand',
    title: 'Go to Connect',
    execute: () => toast('go_to_connect'),
  },
  go_to_connections: {
    icon: 'Box',
    title: 'Go to Connections',
    execute: () => toast('go_to_connections'),
  },
  go_to_connector_configs: {
    icon: 'Boxes',
    title: 'Go to Connector Configs',
    execute: () => toast('go_to_connector_configs'),
  },
  go_to_settings: {
    icon: 'Settings',
    execute: () => toast('go_to_settings'),
  },
  go_to_api_docs: {
    icon: 'FileText',
    title: 'Go to API Docs',
    execute: () => toast('go_to_api_docs'),
  },
} satisfies CommandDefinitionMap

const meta: Meta<typeof CommandBar> = {
  component: CommandBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    ctx: {},
    definitions: navCommands,
  },
  decorators: [
    (StoryFn) => (
      <>
        <StoryFn />
        <Toaster />
      </>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CommandBar>

export const AsGlobalCommandBar: Story = {
  decorators: [
    (StoryFn) => (
      <>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium">
          <span className="text-xs">⌘</span>P
        </kbd>
        <span className="text-muted-foreground mx-2 text-xs font-medium">
          or
        </span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium">
          <span className="text-xs">⌘</span>K
        </kbd>
        <StoryFn />
      </>
    ),
  ],
}

export const AsPopover: Story = {
  render: () => <CommandPopover ctx={{}} definitions={navCommands} />,
}

export const AsInline: Story = {
  render: () => <CommandInline ctx={{}} definitions={navCommands} />,
}

export const AsButton: Story = {
  render: () => (
    <CommandButton
      variant="outline"
      ctx={{}}
      definitions={navCommands}
      command={['go_to_connect', {}]}
    />
  ),
}

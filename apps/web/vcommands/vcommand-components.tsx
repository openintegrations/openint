import type {CommandDraft} from '@openint/commands'
import type {ButtonProps} from '@openint/shadcn/ui/button'
import type {CommandComponentProps} from '@openint/ui-v1/components/command/command-components'
import {
  CommandBar,
  CommandButton,
  CommandPopover,
} from '@openint/ui-v1/components/command/command-components'
import type {CommandContext} from './vcommand-context'
import {WithCommandContext} from './vcommand-context'
import {vDefinitions} from './vcommand-definitions'

export function VCommandMenu(
  props: Pick<CommandComponentProps, 'initialParams'>,
) {
  return (
    <WithCommandContext>
      {(ctx) => (
        <CommandPopover
          {...props}
          ctx={ctx}
          definitions={vDefinitions}
          hideGroupHeadings
        />
      )}
    </WithCommandContext>
  )
}

export function VCommandBar() {
  return (
    <WithCommandContext>
      {(ctx) => (
        <CommandBar ctx={ctx} definitions={vDefinitions} hideGroupHeadings />
      )}
    </WithCommandContext>
  )
}

export function VCommandButton<TKey extends keyof typeof vDefinitions>(
  props: ButtonProps & {
    command: CommandDraft<typeof vDefinitions, TKey, CommandContext>
  },
) {
  return (
    <WithCommandContext>
      {(ctx) => (
        <CommandButton {...props} ctx={ctx} definitions={vDefinitions} />
      )}
    </WithCommandContext>
  )
}

// TODO: Add VCommandButton

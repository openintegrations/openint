'use client'

import type {CommandDefinitionMap, CommandDraft} from '@openint/commands'
import type {ButtonProps} from '@openint/shadcn/ui'

import {MoreHorizontal} from 'lucide-react'
import React from 'react'
import {
  filterCommands,
  prepareCommand,
  prepareCommands,
} from '@openint/commands'
import {cn} from '@openint/shadcn/lib/utils'
import {
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@openint/shadcn/ui'
import {compact} from '@openint/util/array-utils'
import {Icon} from '../Icon'

export interface CommandComponentProps<
  TCtx = any,
  TDefs extends CommandDefinitionMap<TCtx> = CommandDefinitionMap<TCtx>,
> {
  ctx: TCtx
  placeholder?: string
  emptyMessage?: string
  definitions: TDefs
  onSelect?: (key: keyof TDefs) => void
  /** TODO: Better type initialParams from TDefs to be a union of params */
  initialParams?: Record<string, unknown>
  hideGroupHeadings?: boolean
}

export function CommandInline(props: CommandComponentProps) {
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandContent {...props} />
    </Command>
  )
}

/** Rename to CommandMenuButton or CommandPopoverButton */
export function CommandPopover({
  className,
  header,
  ...props
}: CommandComponentProps & {
  className?: string
  header?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className={cn('h-8 w-8 p-0', className)}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        {header && <div className="p-2">{header}</div>}
        <Command>
          <CommandContent
            {...props}
            onSelect={(key) => {
              setOpen(false)
              props.onSelect?.(key)
            }}
          />
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export interface CommandContextValue extends CommandComponentProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const CommandContext = React.createContext<CommandContextValue | null>(
  null,
)

/**
 * Automatically registers keyboard shortcut and show command in a dialog
 * Meant to be used globally once in the app
 */
export function CommandBar(props: CommandComponentProps) {
  // Maybe extract this into its own thing...
  const [_open, _setOpen] = React.useState(false)
  const ctx = React.useContext(CommandContext)
  const open = ctx ? ctx.open : _open
  const setOpen = ctx ? ctx.setOpen : _setOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'p' || e.key === 'k') && e.metaKey) {
        setOpen((open) => !open)
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandContent
        {...props}
        onSelect={(key) => {
          setOpen(false)
          props.onSelect?.(key)
        }}
      />
    </CommandDialog>
  )
}

export function CommandButton<
  TDef extends CommandDefinitionMap<TCtx>,
  TKey extends keyof TDef,
  TCtx = unknown,
>({
  command: [key, params],
  definitions,
  ctx,
  ...buttonProps
}: {
  definitions: TDef
  command: CommandDraft<TDef, TKey, TCtx>
  ctx: TCtx
} & ButtonProps) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const _cmd = prepareCommand([key as string, definitions[key]!])
  const cmd = {..._cmd, ..._cmd.useCommand?.(params ?? {})}

  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        void cmd.execute?.({ctx, params: params ?? {}})

        buttonProps.onClick?.(e)
      }}>
      {cmd.icon && (
        <Icon
          name={cmd.icon}
          className={cn(
            'mr-2 h-4 w-4 shrink-0',
            cmd.subtitle && 'mt-[2px] self-start',
          )}
        />
      )}
      {cmd.title}
    </Button>
  )
}

// MARK: - Inner utils

function CommandItemContainer({
  command: _cmd,
  onSelect,
  params,
  ctx,
}: {
  command: ReturnType<typeof prepareCommands>['commands'][number]
  params?: Record<string, unknown>
  ctx: unknown
  onSelect?: (value: string) => void
}) {
  const cmd = {..._cmd, ..._cmd.useCommand?.(params ?? {})}

  return (
    <CommandItem
      value={compact([cmd.title, cmd.subtitle, cmd.shortcut]).join(' ')}
      onSelect={(currentValue) => {
        void cmd.execute?.({ctx, params: params ?? {}})
        onSelect?.(currentValue)
      }}>
      {cmd.icon && (
        <Icon
          name={cmd.icon}
          className={cn(
            'mr-2 h-4 w-4 shrink-0',
            cmd.subtitle && 'mt-[2px] self-start',
          )}
        />
      )}
      <div className="flex flex-col gap-1 overflow-hidden">
        <span>{cmd.title}</span>
        {cmd.subtitle && (
          <pre
            title={cmd.subtitle}
            className="text-muted-foreground overflow-hidden text-ellipsis">
            {cmd.subtitle}
          </pre>
        )}
      </div>
      {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
    </CommandItem>
  )
}

function CommandContent({
  ctx,
  definitions,
  emptyMessage = 'No commands found.',
  placeholder = 'Search...',
  onSelect,
  initialParams,
  hideGroupHeadings,
}: CommandComponentProps) {
  const {commandGroups} = React.useMemo(() => {
    const prepared = prepareCommands({definitions})
    return filterCommands({
      commands: prepared.commands,
      // Filter regardless because without initialParams we currently only want global commands.
      params: initialParams ?? {},
    })
  }, [definitions, initialParams])

  return (
    <>
      <CommandInput placeholder={placeholder} />
      <CommandEmpty>{emptyMessage}</CommandEmpty>
      <CommandList>
        {Object.entries(commandGroups).map(([groupName, commands]) => (
          <CommandGroup
            key={groupName}
            heading={!hideGroupHeadings && groupName}>
            {commands.map((cmd) => (
              <CommandItemContainer
                key={cmd.key}
                ctx={ctx}
                command={cmd}
                onSelect={onSelect}
                params={initialParams}
              />
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </>
  )
}

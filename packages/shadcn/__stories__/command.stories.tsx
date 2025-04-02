/* eslint-disable @typescript-eslint/no-confusing-void-expression */
/* eslint-disable react-hooks/rules-of-hooks */
import type {Meta, StoryObj} from '@storybook/react'
import {
  Calculator,
  Calendar,
  CreditCard,
  MoreVertical,
  Settings,
  Smile,
  User,
} from 'lucide-react'
import React from 'react'
import {Button, Popover, PopoverContent, PopoverTrigger} from '../ui'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../ui/command'

const meta: Meta<typeof CommandInput> = {
  component: CommandInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CommandInput>

const InnerContent = () => {
  const [value, setValue] = React.useState('')
  return (
    <>
      <CommandInput
        placeholder="Type a command or search..."
        value={value}
        onValueChange={setValue}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  )
}

export const Inline = () => (
  <Command className="rounded-lg border shadow-md">
    <InnerContent />
  </Command>
)

export const AsDialog: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === 'i' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        }
      }
      document.addEventListener('keydown', down)
      return () => document.removeEventListener('keydown', down)
    }, [])

    return (
      <>
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="mb-4 flex items-center gap-2">
          <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium">
            <span className="text-xs">⌘</span>I
          </kbd>
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <InnerContent />
        </CommandDialog>
      </>
    )
  },
}

export const AsPopover: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    React.useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        }
      }
      document.addEventListener('keydown', down)
      return () => document.removeEventListener('keydown', down)
    }, [])

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="default">
              <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium">
                <span className="text-xs">⌘</span>P
              </kbd>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent className="border-none p-0 shadow-none" align="start">
            <Inline />
          </PopoverContent>
        </Popover>
      </>
    )
  },
}

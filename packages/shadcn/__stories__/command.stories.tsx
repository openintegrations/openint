/* eslint-disable jsx-a11y/no-autofocus */
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
import {
  Button,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '../ui'
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
  title: 'Shadcn/Command',
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

    return (
      <>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className="mb-4">
          Open Command Dialog
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
    const [open, setOpen] = React.useState(true)

    return (
      <>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
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

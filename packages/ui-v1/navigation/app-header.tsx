'use client'

import {usePathname} from 'next/navigation'
import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Button} from '@openint/shadcn/ui'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@openint/shadcn/ui/breadcrumb'
import {Separator} from '@openint/shadcn/ui/separator'
import {SidebarTrigger} from '@openint/shadcn/ui/sidebar'
import {CommandContext} from '../components'

export function AppHeader(props: {userButton: React.ReactNode}) {
  const path = usePathname() ?? '/'

  // Extract title from path
  let title = 'Dashboard'
  const consoleMatch = path?.match(/\/console(?:\/(.+))?/)

  if (consoleMatch && consoleMatch[1]) {
    // Extract the last segment after /console/
    const lastSegment = consoleMatch[1].split('/').pop() || ''

    // Format the title: capitalize first letter of each word separated by '-'
    title = lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center">
        <CommandBarShortcut />
        <div className="w-27">{props.userButton}</div>
      </div>
    </header>
  )
}

// Command bar keyboard shortcut component
export function CommandBarShortcut({className}: {className?: string}) {
  const ctx = React.useContext(CommandContext)
  return (
    <Button variant="ghost" onClick={() => ctx?.setOpen((o) => !o)}>
      <kbd
        className={cn(
          'bg-muted text-muted-foreground pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-xs font-medium',
          className,
        )}>
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}

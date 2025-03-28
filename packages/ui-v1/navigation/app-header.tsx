'use client'

import {usePathname} from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@openint/shadcn/ui/breadcrumb'
import {Separator} from '@openint/shadcn/ui/separator'
import {SidebarTrigger} from '@openint/shadcn/ui/sidebar'

export function AppHeader(props: {userButton: React.ReactNode}) {
  const path = usePathname()

  // Extract title from path
  let title = 'Dashboard'
  const consoleMatch = path.match(/\/console(?:\/(.+))?/)

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
      <div className="ml-auto">{props.userButton}</div>
    </header>
  )
}

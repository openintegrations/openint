'use client'

import Image from 'next/image'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import * as React from 'react'
import {Button} from '@openint/shadcn/ui'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@openint/shadcn/ui/sidebar'
import {isProduction} from '../../env'
import type {IconName} from '../components'
import {Icon} from '../components'

export let SIDEBAR_NAV_ITEMS = [
  {
    title: 'Dashboard',
    url: '/console',
    icon: 'Box',
  },
  {
    title: 'Connect',
    url: '/console/connect',
    icon: 'Wand',
  },
  {
    title: 'Connector Configs',
    url: '/console/connector-config',
    icon: 'Layers',
  },
  {
    title: 'Events',
    url: '/console/events',
    icon: 'Database',
  },
  {
    title: 'Customers',
    url: '/console/customers',
    icon: 'Users',
  },
  {
    title: 'Connections',
    url: '/console/connections',
    icon: 'Box',
  },
  {
    title: 'Settings',
    url: '/console/settings',
    icon: 'Settings',
  },
  {
    title: 'API Docs',
    url: 'https://docs.openint.dev',
    icon: 'ExternalLink',
  },
] satisfies Array<{
  title: string
  url: `${string}`
  icon: IconName
}>

if (isProduction) {
  SIDEBAR_NAV_ITEMS = SIDEBAR_NAV_ITEMS.slice(0, 1)
}

export function AppSidebar({
  organizationSwitcher,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  organizationSwitcher: React.ReactNode
}) {
  // In storybook, pathname would be undefined
  const pathname: string | undefined = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>{organizationSwitcher}</SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="mt-5">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const isActive =
              pathname?.replace(/\/*$/, '') === item.url.replace(/\/*$/, '')
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="w-full">
                  <Link
                    href={item.url}
                    className="flex w-full items-center px-4 py-2"
                    target={item.url.startsWith('http') ? '_blank' : undefined}>
                    {item.icon && (
                      <Icon name={item.icon} className="mr-3 h-5 w-5" />
                    )}
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      <div className="mb-10 mt-auto flex flex-col items-center justify-center space-y-4">
        <Button
          variant="default"
          size="sm"
          className="mb-4 justify-center"
          style={{width: '146px'}}
          onClick={() =>
            window.open('https://cal.com/ap-openint/discovery', '_blank')
          }>
          Book A Demo
          <Icon name="ExternalLink" className="mr-2 h-4 w-4" />
        </Button>
        <Image width={146} height={40} src="/openint-logo.svg" alt="OpenInt" />
      </div>
      <SidebarRail />
    </Sidebar>
  )
}

'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import * as React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@openint/shadcn/ui/sidebar'

const navMain = [
  {
    title: 'Getting Started',
    items: [
      {
        title: 'Installation',
        url: '/console/',
      },
      {
        title: 'Project Structure',
        url: '/console/project-structure',
      },
    ],
  },
  {
    title: 'Building Your Application',
    items: [
      {
        title: 'Magic Link',
        url: '/console/magic-link',
      },
      {
        title: 'Connections',
        url: '/console/connections',
        isActive: true,
      },
      {
        title: 'Connector Configs',
        url: '/console/connector-config',
      },
      {
        title: 'Connectors',
        url: '/console/connectors',
      },
    ],
  },
  {
    title: 'Docs',
    items: [
      {
        title: 'Settings',
        url: '/console/settings',
      },
      {
        title: 'Guides',
        url: '/console/guides',
      },
      {
        title: 'API Reference',
        url: '/console/api-reference',
      },
    ],
  },
] satisfies Array<{
  title: string
  items: Array<{
    title: string
    // TODO: Figure out how to type this to be the statically generated list of URLs from next.js
    url: `/console${string}`
    isActive?: boolean
  }>
}>

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
        {/* We create a SidebarGroup for each parent. */}
        {navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive =
                    pathname?.replace(/\/*$/, '') ===
                    item.url.replace(/\/*$/, '')
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

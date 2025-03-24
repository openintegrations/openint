'use client'

import Link from 'next/link'
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
import {OrganizationSwitcher} from '@/lib-server/auth.client'

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
        url: '/console/connector-configs',
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

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive =
                    window.location.pathname.replace(/\/*$/, '') ===
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

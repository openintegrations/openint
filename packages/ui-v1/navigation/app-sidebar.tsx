'use client'

import type {IconName} from '../components'

import Image from 'next/image'
import NextLink from 'next/link'
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
import {Icon} from '../components'

export type AppSidebarProps = {
  navItems: Array<{
    title: string
    /** These URLs should already be pre-resolved */
    url: string
    icon: IconName
  }>
  organizationSwitcher: React.ReactNode
}

export function AppSidebar({
  organizationSwitcher,
  navItems,
  ...props
}: React.ComponentProps<typeof Sidebar> & AppSidebarProps) {
  // In storybook, pathname would be undefined
  const pathname: string | undefined = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-11">{organizationSwitcher}</SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="mt-5">
          {navItems.map((item) => {
            const isActive =
              pathname?.replace(/\/*$/, '') === item.url.replace(/\/*$/, '')
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="w-full">
                  <NextLink
                    href={item.url}
                    className="flex w-full items-center px-4 py-2"
                    target={item.url.startsWith('http') ? '_blank' : undefined}>
                    {item.icon && (
                      <Icon name={item.icon} className="mr-3 h-5 w-5" />
                    )}
                    {item.title}
                  </NextLink>
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

'use client'

import {useOrganization, useOrganizationList} from '@clerk/nextjs'
import {useRouter} from 'next/navigation'
import React from 'react'
import type {
  CommandDefinitionInput,
  CommandDefinitionMap,
} from '@openint/commands'
import {CommandBar, CommandContext} from '@openint/ui-v1'
import {SIDEBAR_NAV_ITEMS} from '@openint/ui-v1/navigation/app-sidebar'

export function GlobalCommandBarProvider(props: {children: React.ReactNode}) {
  // Switch organization commands
  const orgList = useOrganizationList({userMemberships: true})
  const org = useOrganization()

  const orgCommands = Object.fromEntries(
    (orgList.userMemberships.data ?? [])
      .filter((mem) => mem.organization.id !== org.organization?.id)
      .map((mem): [string, CommandDefinitionInput] => [
        `switch_organization:${mem.organization.slug}`,
        {
          group: 'Switch Organization',
          icon: 'OctagonAlert',
          title: `Switch to ${mem.organization.name} (${mem.organization.slug})`,
          execute: () => {
            orgList.setActive?.({organization: mem.organization.id})
          },
        },
      ]),
  )

  // Navigation commands

  const router = useRouter()
  const navCommands = Object.fromEntries(
    SIDEBAR_NAV_ITEMS.map((item): [string, CommandDefinitionInput] => [
      `navigate:${item.url.replace(/^\//, '')}`,
      {
        group: 'Navigation',
        title: `Go to ${item.title}`,
        icon: item.icon,
        execute: () => {
          router.push(item.url)
        },
      },
    ]),
  )
  const allCommands: CommandDefinitionMap = {
    ...navCommands,
    ...orgCommands,
    // Add any other global commands here
  }

  const [open, setOpen] = React.useState(false)
  return (
    <CommandContext.Provider
      value={{
        open,
        setOpen,
        ctx: {},
        definitions: allCommands,
      }}>
      <CommandBar ctx={{}} definitions={allCommands} />

      {props.children}
    </CommandContext.Provider>
  )
}

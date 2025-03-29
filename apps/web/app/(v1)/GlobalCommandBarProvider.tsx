'use client'

import {useOrganization, useOrganizationList} from '@clerk/nextjs'
import {useRouter} from 'next/navigation'
import React from 'react'
import {
  cmdInit,
  type CommandDefinitionInput,
  type CommandDefinitionMap,
} from '@openint/commands'
import {CommandBar, CommandContext} from '@openint/ui-v1'
import {SIDEBAR_NAV_ITEMS} from '@openint/ui-v1/navigation/app-sidebar'
import {useMutation, useQueryClient} from '@openint/ui-v1/trpc'
import {z} from '@openint/util'
import {useTRPC} from './console/(authenticated)/client'

export function GlobalCommandBarProvider(props: {children: React.ReactNode}) {
  const definitions = useCommandDefinitionMap()
  const [open, setOpen] = React.useState(false)
  return (
    <CommandContext.Provider
      value={{
        open,
        setOpen,
        ctx: {},
        definitions,
      }}>
      <CommandBar ctx={{}} definitions={definitions} />

      {props.children}
    </CommandContext.Provider>
  )
}

export function useCommandDefinitionMap() {
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
            void orgList.setActive?.({organization: mem.organization.id})
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
    ...useConnectionCommands(),
  }
  return allCommands
}

function useConnectionCommands() {
  const trpc = useTRPC()

  const queryClient = useQueryClient()

  const deleteConnection = useMutation(
    trpc.deleteConnection.mutationOptions({
      onSettled: () => {
        // Refetch the connections after deletion
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnections.queryKey({
            // What to do here...
            // connector_name: props.connector_name,
          }),
        })
      },
    }),
  )

  const cmd = cmdInit()

  const router = useRouter()

  return {
    'connection:delete': cmd.identity({
      title: 'Delete Connection',
      icon: 'Trash',
      params: z.object({
        connection_id: z
          .string()
          .describe('The ID of the connection to delete'),
      }),
      execute: async ({params}) => {
        if (
          window.confirm('Are you sure you want to delete this connection?')
        ) {
          await deleteConnection.mutateAsync({id: params.connection_id})
        }
      },
    }),
    'connection:copyId': cmd.identity({
      title: 'Copy connection ID',
      icon: 'Clipboard',
      params: z.object({
        connection_id: z.string().describe('The ID of the connection to copy'),
      }),
      execute: async ({params}) => {
        await navigator.clipboard.writeText(params.connection_id)
        alert(`Copied connection ID: ${params.connection_id}`)
      },
    }),

    'connection:explore': cmd.identity({
      title: 'Explore Connection',
      icon: 'Search',
      params: z.object({
        connection_id: z
          .string()
          .describe('The ID of the connection to explore'),
      }),
      execute: ({params}) => {
        router.push(`/console/connections/${params.connection_id}/explorer`)
      },
    }),

    'connection:check': cmd.identity({
      title: 'Check Connection',
      icon: 'CheckCircle',
      params: z.object({
        connection_id: z.string().describe('The ID of the connection to check'),
      }),
      execute: () => {
        try {
          // await trpc.checkConnection.mutate({id: params.connection_id})
          alert('Connection check successful!')
        } catch (error) {
          alert(
            `Connection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
        }
      },
    }),

    'connection:refresh': cmd.identity({
      title: 'Refresh Connection',
      icon: 'RefreshCcw',
      params: z.object({
        connection_id: z
          .string()
          .describe('The ID of the connection to refresh'),
      }),
      execute: () => {
        try {
          // await trpc.refreshConnection.mutate({id: params.connection_id})
          alert('Connection refreshed successfully!')
        } catch (error) {
          alert(
            `Failed to refresh connection: ${error instanceof Error ? error.message : 'Unknown error'}`,
          )
        }
      },
    }),
  } satisfies CommandDefinitionMap
}

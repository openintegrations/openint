'use client'

import type {
  CommandDefinitionInput,
  CommandDefinitionMap,
  CommandDefinitionMapInput,
} from '@openint/commands'

import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useRouter} from 'next/navigation'
import React, {useEffect} from 'react'
import {cmdInit} from '@openint/commands'
import {
  useOrganization,
  useOrganizationList,
  useSession,
} from '@openint/console-auth/client'
import {toast, Toaster} from '@openint/shadcn/ui/sonner'
import {CommandBar, CommandContext} from '@openint/ui-v1'
import {ConfirmationProvider} from '@openint/ui-v1/components/ConfirmAlert'
import {useTheme} from '@openint/ui-v1/components/ThemeProvider'
import {z} from '@openint/util/zod-utils'
import {SIDEBAR_NAV_ITEMS} from '@/app/console/(authenticated)/sidebar-nav-items'
import {useTRPC} from './TRPCApp'

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
      <ConfirmationProvider>
        <CommandBar ctx={{}} definitions={definitions} />
        <Toaster />
        {props.children}
      </ConfirmationProvider>
    </CommandContext.Provider>
  )
}

export function useCommandDefinitionMap() {
  // Switch organization commands
  const orgList = useOrganizationList({
    userMemberships: {pageSize: 500}, // No user would have been able to have more than 500 orgs, so this is good enough to get it all in one go
  })
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

  const {theme, setTheme} = useTheme()
  const themeCommands = {
    'theme:toggle': {
      title: 'Toggle theme',
      icon: 'SunMoon',
      execute: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    'theme:reset': {
      title: 'Reset theme to system default',
      icon: 'Monitor',
      execute: () => setTheme('system'),
    },
  } satisfies CommandDefinitionMapInput

  const allCommands: CommandDefinitionMapInput = {
    ...navCommands,
    ...orgCommands,
    ...themeCommands,
    ...useConnectionCommands(),
    ...useCurrentSessionCommands(),
  }

  return Object.fromEntries(
    Object.entries(allCommands).filter(([_, def]) => !!def),
  ) as CommandDefinitionMap
}

function useCurrentSessionCommands() {
  const queryClient = useQueryClient()
  const {userId, orgId} = useSession()
  useEffect(() => {
    // Invalidate all queries when the orgId changes
    void queryClient.invalidateQueries()
  }, [orgId, queryClient])

  return {
    'currentSession:copyUserId': userId && {
      title: 'Copy current user ID',
      icon: 'User',
      execute: async () => {
        await navigator.clipboard.writeText(userId)
        toast.success('User ID copied to clipboard')
      },
    },
    'currentSession:copyOrgId': orgId && {
      title: 'Copy current organization ID',
      icon: 'Building',
      execute: async () => {
        await navigator.clipboard.writeText(orgId)
        toast.success('Organization ID copied to clipboard')
      },
    },
  } satisfies CommandDefinitionMapInput
}

function useConnectionCommands() {
  const trpc = useTRPC()

  const queryClient = useQueryClient()

  let loadingToastId: string | number = ''
  const deleteConnection = useMutation(
    trpc.deleteConnection.mutationOptions({
      onMutate: () => {
        loadingToastId = toast.loading('Deleting connection...')
      },
      onSuccess: () => {
        toast.dismiss(loadingToastId)
        toast.success('Connection deleted successfully!')
      },
      onError: (error) => {
        toast.dismiss(loadingToastId)
        toast.error(`Connection deletion failed: ${error.message}`)
      },
      onSettled: () => {
        // Refetch the connections after deletion
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnections.queryKey(),
        })
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnectorConfigs.queryKey(),
        })
      },
    }),
  )

  const checkConnection = useMutation(
    trpc.checkConnection.mutationOptions({
      onMutate: (_variables) => {
        loadingToastId = toast.loading('Attempting to refresh connection...')
      },
      onSuccess: () => {
        toast.dismiss(loadingToastId)
        toast.success('Connection refreshed successfully!')
      },
      onError: (error) => {
        toast.dismiss(loadingToastId)
        toast.error(`Connection refresh failed: ${error.message}`)
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.listConnections.queryKey(),
        })
      },
    }),
  )

  const cmd = cmdInit()

  return {
    'connection:copyId': cmd.identity({
      title: 'Copy connection ID',
      icon: 'Clipboard',
      params: z.object({
        connection_id: z.string().describe('The ID of the connection to copy'),
      }),
      execute: async ({params}) => {
        await navigator.clipboard.writeText(params.connection_id)
        toast.success(`Copied connection ID: ${params.connection_id}`)
      },
    }),
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
    'connection:check': cmd.identity({
      title: 'Refresh Connection',
      icon: 'RefreshCcw',
      params: z.object({
        connection_id: z.string().describe('The ID of the connection to check'),
      }),
      execute: async ({params}) => {
        await checkConnection.mutateAsync({id: params.connection_id})
      },
    }),
  } satisfies CommandDefinitionMap
}

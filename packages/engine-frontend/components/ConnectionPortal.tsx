'use client'

import {Loader2} from 'lucide-react'
import {useTheme} from 'next-themes'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {useEffect} from 'react'
import type {Id} from '@openint/cdk'
import type {UIPropsNoChildren} from '@openint/ui'
import {useToast} from '@openint/ui'
import {Tabs} from '@openint/ui/components/Tabs'
import {cn} from '@openint/ui/utils'
import {R} from '@openint/util'
import {WithConnectConfig} from '../hocs/WithConnectConfig'
import {_trpcReact} from '../providers/TRPCProvider'
import {AddConnectionTabContent} from './AddConnectionTabContent'
import {ConnectionsTabContent} from './ConnectionsTabContent'

type ConnectEventType = 'open' | 'close' | 'error'

// Add these constants at the top level of the file, before the ConnectionPortal component
const VIEW_BASE = {
  ADD: 'add',
  MANAGE: 'manage',
} as const

const getBaseView = (
  view: string | null,
): (typeof VIEW_BASE)[keyof typeof VIEW_BASE] => {
  if (!view) return VIEW_BASE.MANAGE
  return view.split('-')[0] as (typeof VIEW_BASE)[keyof typeof VIEW_BASE]
}

export function LoadingSpinner() {
  return (
    <div className="flex h-full min-h-[600px] flex-1 items-center justify-center">
      <Loader2 className="size-7 animate-spin text-button" />
    </div>
  )
}

export interface ConnectionPortalProps extends UIPropsNoChildren {
  onEvent?: (event: {type: ConnectEventType; ccfgId: Id['ccfg']}) => void
}

// Helper to validate theme value
const isValidTheme = (theme: string | null): theme is 'light' | 'dark' =>
  theme === 'light' || theme === 'dark'

// TODO: Wrap this in memo so it does not re-render as much as possible.
// Also it would be nice if there was an easy way to automatically prefetch on the server side
// based on calls to useQuery so it doesn't need to be separately handled again on the client...
export function ConnectionPortal({className}: ConnectionPortalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const {theme, setTheme} = useTheme()
  const connectionId = searchParams.get('connectionId')

  const {toast} = useToast()
  const ctx = _trpcReact.useContext()
  const listConnectionsRes = _trpcReact.listConnections.useQuery({
    connectionId: connectionId ?? undefined,
  })

  useEffect(() => {
    const themeParam = searchParams.get('theme')

    // Only update if there's a valid theme parameter that differs from current theme
    if (themeParam && isValidTheme(themeParam) && themeParam !== theme) {
      setTheme(themeParam)
    } else if (!themeParam && theme) {
      // Only update URL if there's no theme parameter but we have a theme set
      const params = new URLSearchParams(searchParams)
      params.set('theme', theme)
      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      })
    }
  }, [searchParams, setTheme, theme, pathname, router])

  const deleteConnection = _trpcReact.deleteConnection.useMutation({
    onSuccess: () => {
      toast({title: 'Connection deleted', variant: 'success'})
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete connection',
        description: `${err.message}`,
        variant: 'destructive',
      })
    },
    onSettled: () => {
      ctx.listConnections.invalidate()
    },
  })

  const navigateToTab = (tab: string) => {
    const params = new URLSearchParams(searchParams ?? {})
    params.set('view', tab)
    router.replace(`${pathname}?${params.toString()}`, {
      scroll: false,
    })
  }

  return (
    <WithConnectConfig>
      {({ccfgs}) => {
        if (!ccfgs.length) {
          return <div>No connectors configured</div>
        }

        const connectorConfigById = R.mapToObj(ccfgs, (i) => [i.id, i])
        const connections = (listConnectionsRes.data || [])
          .map((conn) => {
            const ccfg = connectorConfigById[conn.connectorConfigId]
            if (!ccfg) {
              console.warn('Missing connector config for connection', conn)
            }
            return ccfg ? {...conn, connectorConfig: ccfg} : null
          })
          .filter((c): c is NonNullable<typeof c> => !!c)

        const connectionCount = connections.length

        const isLoading =
          listConnectionsRes.isLoading || listConnectionsRes.isFetching

        const baseView = getBaseView(searchParams?.get('view'))

        const tabConfig = [
          {
            key: 'manage',
            title: `My Connections (${connectionCount})`,
            content: isLoading ? (
              <LoadingSpinner />
            ) : (
              <ConnectionsTabContent
                connectionCount={connectionCount}
                deleteConnection={deleteConnection.mutate}
                isDeleting={deleteConnection.isLoading}
                connections={connections}
                onConnect={() => navigateToTab('add')}
                refetch={() => ctx.listConnections.invalidate()}
              />
            ),
          },
          {
            key: 'add',
            title: 'Add a Connection',
            content: isLoading ? (
              <LoadingSpinner />
            ) : (
              <AddConnectionTabContent
                connectorConfigFilters={{}}
                refetch={listConnectionsRes.refetch}
                onSuccessCallback={async () => {
                  navigateToTab('manage')
                  await listConnectionsRes.refetch()
                }}
              />
            ),
          },
        ]

        return (
          <div
            className={cn(
              'flex size-full flex-col gap-4 overflow-hidden bg-background',
              theme === 'dark' ? 'dark' : '',
              className,
            )}>
            <Tabs
              tabConfig={tabConfig}
              value={
                baseView ??
                (connectionCount === 0 ? VIEW_BASE.ADD : VIEW_BASE.MANAGE)
              }
              onValueChange={navigateToTab}
              className="flex h-full flex-col"
            />
          </div>
        )
      }}
    </WithConnectConfig>
  )
}

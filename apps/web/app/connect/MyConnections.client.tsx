'use client'

import {useSuspenseQuery} from '@tanstack/react-query'
import React from 'react'
import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {Button} from '@openint/shadcn/ui'
import {
  CommandPopover,
  ConnectionStatusPill,
  DataTileView,
  Spinner,
  useMutableSearchParams,
} from '@openint/ui-v1'
import {ConnectionCard} from '@openint/ui-v1/domain-components/ConnectionCard'
import {timeSince} from '@openint/ui-v1/utils'
import {useTRPC} from '@/lib-client/TRPCApp'
import {useCommandDefinitionMap} from '../../lib-client/GlobalCommandBarProvider'

export function MyConnectionsClient(props: {
  connector_names?: ConnectorName[]
}) {
  const [_, setSearchParams] = useMutableSearchParams()
  const [isLoading, setIsLoading] = React.useState(true)
  const trpc = useTRPC()

  React.useEffect(() => {
    setIsLoading(false)
  }, [])

  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions({
      connector_names: props.connector_names?.length
        ? props.connector_names
        : undefined,
      expand: ['connector'],
    }),
  )

  const definitions = useCommandDefinitionMap()

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!res.data?.items?.length || res.data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-muted-foreground">
          You have no configured integrations.
        </p>
        <Button
          variant="default"
          onClick={() => setSearchParams({view: 'add'}, {shallow: true})}>
          Add your first integration
        </Button>
      </div>
    )
  }

  return (
    <DataTileView
      data={res.data.items}
      columns={[]}
      getItemId={(conn) => conn.id}
      renderItem={(conn) => (
        <ConnectionCard connection={conn} className="relative">
          <CommandPopover
            className="absolute right-2 top-2"
            hideGroupHeadings
            initialParams={{
              connection_id: conn.id,
            }}
            ctx={{}}
            definitions={definitions}
            header={
              <>
                <div className="flex items-center justify-center gap-1 text-center">
                  <ConnectionStatusPill status={conn.status} />
                  <span className="text-muted-foreground text-xs">
                    ({timeSince(conn.updated_at)})
                  </span>
                </div>
              </>
            }
          />
        </ConnectionCard>
      )}
    />
  )
}

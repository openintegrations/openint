'use client'

import {useSuspenseQuery} from '@tanstack/react-query'
import {Link} from 'lucide-react'
import React from 'react'
import {type ConnectorName} from '@openint/api-v1/trpc/routers/connector.models'
import {Id} from '@openint/cdk'
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
import {ConnectorConnectContainer} from './ConnectorConnect.client'

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
    return <Spinner />
  }

  if (!res.data?.items?.length || res.data.items.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center gap-6 py-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="bg-primary/10 rounded-full p-4">
            <Link className="text-primary h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold">
            Let&apos;s Get You Connected
          </h3>
          <p className="text-muted-foreground">
            You have not configured any integrations yet. Connect your first app
            to get started.
          </p>
        </div>
        <Button
          size="lg"
          className="font-medium"
          onClick={() => {
            setIsLoading(true)
            setSearchParams({view: 'add'}, {shallow: false})
          }}
          disabled={isLoading}>
          Add First Integration
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">My Integrations</h1>
        <Button
          size="lg"
          onClick={() => {
            setIsLoading(true)
            setSearchParams({view: 'add'}, {shallow: false})
          }}
          disabled={isLoading}>
          Add Integration
        </Button>
      </div>

      <div className="mt-4"></div>
      <DataTileView
        data={res.data.items}
        columns={[]}
        className="grid grid-cols-2 gap-6 md:grid-cols-4"
        getItemId={(conn) => conn.id}
        renderItem={(conn) => {
          const renderCard = ({
            handleConnect,
          }: {
            handleConnect?: () => void
          }) => (
            <ConnectionCard
              connection={conn}
              className="relative"
              onReconnect={handleConnect}>
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
          )

          if (conn.status !== 'disconnected') {
            return renderCard({handleConnect: undefined})
          }

          return (
            <ConnectorConnectContainer
              connectorName={conn.connector_name as ConnectorName}
              connector={{authType: 'OAUTH2'} as any}
              connectorConfigId={conn.connector_config_id as Id['ccfg']}
              connectionId={conn.id as Id['conn']}>
              {renderCard}
            </ConnectorConnectContainer>
          )
        }}
      />
    </>
  )
}

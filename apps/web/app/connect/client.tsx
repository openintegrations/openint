'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import {AppRouterOutput} from '@openint/api-v1'
import {ConnectorConfig} from '@openint/api-v1/models'
import type {ConnectorClient} from '@openint/cdk'
import {Label} from '@openint/shadcn/ui'
import {CommandPopover, DataTileView, Spinner} from '@openint/ui-v1'
import {ConnectionCard} from '@openint/ui-v1/domain-components/ConnectionCard'
import {ConnectorConfigCard} from '@openint/ui-v1/domain-components/ConnectorConfigCard'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {useTRPC} from '../console/(authenticated)/client'
import {useCommandDefinitionMap} from '../GlobalCommandBarProvider'

const connectorImports = {
  plaid: () => import('@openint/connector-plaid/client'),
  greenhouse: () => Promise.resolve({}),
  finch: () => import('@openint/connector-finch/client'),
}

type ConnectFn = ReturnType<NonNullable<ConnectorClient['useConnectHook']>>

function wrapConnectorClientModule(
  mod: ConnectorClient | {default: ConnectorClient},
) {
  const client: ConnectorClient =
    'useConnectHook' in mod ? mod : 'default' in mod ? mod.default : mod

  return React.memo(function ModuleWrapper(props: {
    connector_name?: string
    onConnectFn: (fn?: ConnectFn) => void
  }) {
    console.log('ModuleWrapper rendering', props.connector_name, client)
    const connectFn = client.useConnectHook?.({openDialog: () => {}})
    const {onConnectFn} = props

    React.useEffect(() => {
      if (connectFn) {
        onConnectFn(connectFn)
      }
    }, [onConnectFn, connectFn])

    return null
  })
}

const ConnectorClientComponents = Object.fromEntries(
  Object.entries(connectorImports).map(([name, importModule]) => [
    name,
    dynamic(() => importModule().then((m) => wrapConnectorClientModule(m)), {
      loading: () => <div>...Loading {name}...</div>,
    }),
  ]),
)
export type ConnectorConfigForCustomer = Pick<
  ConnectorConfig<'connector'>,
  'id' | 'connector_name' | 'connector'
>

export function AddConnectionInner({
  connectorConfig,
  ...props
}: {
  connectorConfig: ConnectorConfigForCustomer
  onReady?: (ctx: {state: string}, name: string) => void
  initialData?: Promise<AppRouterOutput['preConnect']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const [isConnecting, setIsConnecting] = React.useState(false)

  const name = connectorConfig.connector_name

  console.log('AddConnectionInner rendering', name)

  const ref = React.useRef<ConnectFn | undefined>(undefined)

  const trpc = useTRPC()
  // Should load script immediately (via useConnectHook) rather than waiting for suspense query?
  const preConnectRes = useSuspenseQuery(
    trpc.preConnect.queryOptions(
      {
        id: connectorConfig.id,
        data: {
          connector_name: name,
          input: {},
        },
        options: {},
      },
      initialData ? {initialData} : undefined,
    ),
  )
  console.log('preConnectRes', preConnectRes)

  const postConnect = useMutation(trpc.postConnect.mutationOptions({}))

  const handleConnect = React.useCallback(async () => {
    try {
      setIsConnecting(true)
      const connectRes = await ref.current?.(preConnectRes.data.output, {
        connectorConfigId: connectorConfig.id as `ccfg_${string}`,
        connectionExternalId: undefined,
        integrationExternalId: undefined,
      })
      console.log('connectRes', connectRes)
      await postConnect.mutateAsync({
        id: connectorConfig.id,
        data: {
          connector_name: name,
          input: connectRes,
        },
        options: {},
      })
    } finally {
      setIsConnecting(false)
    }
  }, [connectorConfig, preConnectRes])

  const Component =
    ConnectorClientComponents[name as keyof typeof ConnectorClientComponents]
  if (!Component) {
    throw new Error(`Unknown connector: ${name}`)
  }
  if (isConnecting || postConnect.isPending) {
    return <Spinner />
  }
  return (
    <>
      {/*
       Very careful to not cause infinite loop here during rendering
       need to make ourselves a pure component
       */}

      <Component
        key={name}
        connector_name={name}
        onConnectFn={React.useCallback((fn) => {
          ref.current = fn

          // onReady(c, name)
          // setFn(c)
        }, [])}
      />

      <ConnectorConfigCard
        displayNameLocation="right"
        // TODO: fix this
        connectorConfig={connectorConfig as ConnectorConfig<'connector'>}
        onPress={() => handleConnect()}>
        <Label className="text-muted-foreground pointer-events-none ml-auto text-sm">
          {isConnecting || postConnect.isPending ? 'Connecting...' : 'Connect'}
        </Label>
      </ConnectorConfigCard>
    </>
  )
}

export function MyConnectionsClient(props: {
  connector_name?: string
  initialData?: Promise<AppRouterOutput['listConnections']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const [isLoading, setIsLoading] = React.useState(true)
  const trpc = useTRPC()

  React.useEffect(() => {
    setIsLoading(false)
  }, [])

  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {connector_name: props.connector_name, expand: ['connector']},
      initialData ? {initialData} : undefined,
    ),
  )

  const definitions = useCommandDefinitionMap()

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!res.data.items.length) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No connections found
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
          />
        </ConnectionCard>
      )}
    />
  )
}

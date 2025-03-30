'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import {AppRouterOutput} from '@openint/api-v1'
import {ConnectorConfig} from '@openint/api-v1/models'
import type {ConnectorClient} from '@openint/cdk'
import {Label} from '@openint/shadcn/ui'
import {Button} from '@openint/shadcn/ui/button'
import {CommandPopover, DataTileView} from '@openint/ui-v1'
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

export function AddConnectionInner({
  connectorConfig,
  ...props
}: {
  connectorConfig: ConnectorConfig<'connector'>
  onReady?: (ctx: {state: string}, name: string) => void
  initialData?: Promise<AppRouterOutput['preConnect']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))

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
    console.log('ref.current', ref.current)
    const connectRes = await ref.current?.(preConnectRes.data.output, {
      connectorConfigId: connectorConfig.id as `ccfg_${string}`,
      connectionExternalId: undefined,
      integrationExternalId: undefined,
    })
    console.log('connectRes', connectRes)
    const postConnectRes = await postConnect.mutateAsync({
      id: connectorConfig.id,
      data: {
        connector_name: name,
        input: connectRes,
      },
      options: {},
    })
    console.log('postConnectRes', postConnectRes)
  }, [connectorConfig, preConnectRes])

  const Component =
    ConnectorClientComponents[name as keyof typeof ConnectorClientComponents]
  if (!Component) {
    throw new Error(`Unknown connector: ${name}`)
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
        connectorConfig={connectorConfig}
        onPress={() => handleConnect()}>
        <Label className="text-muted-foreground pointer-events-none ml-auto text-sm">
          Connect
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
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {connector_name: props.connector_name, expand: ['connector']},
      initialData ? {initialData} : undefined,
    ),
  )

  const definitions = useCommandDefinitionMap()
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

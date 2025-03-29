'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type {AppRouterOutput} from '@openint/api-v1/routers'
import type {ConnectorClient} from '@openint/cdk'
import {extractId} from '@openint/cdk'
import {Button} from '@openint/shadcn/ui'
import {CommandPopover} from '@openint/ui-v1'
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
  connectorConfigId,
  ...props
}: {
  connectorConfigId: string
  onReady?: (ctx: {state: string}, name: string) => void
  initialData?: Promise<AppRouterOutput['preConnect']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))

  const name = extractId(connectorConfigId as `ccfg_${string}`)[1]

  console.log('AddConnectionInner rendering', name)

  const ref = React.useRef<ConnectFn | undefined>(undefined)

  const trpc = useTRPC()
  // Should load script immediately (via useConnectHook) rather than waiting for suspense query?
  const preConnectRes = useSuspenseQuery(
    trpc.preConnect.queryOptions(
      {
        id: connectorConfigId,
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
      connectorConfigId: connectorConfigId as `ccfg_${string}`,
      connectionExternalId: undefined,
      integrationExternalId: undefined,
    })
    console.log('connectRes', connectRes)
    const postConnectRes = await postConnect.mutateAsync({
      id: connectorConfigId,
      data: {
        connector_name: name,
        input: connectRes,
      },
      options: {},
    })
    console.log('postConnectRes', postConnectRes)
  }, [connectorConfigId, preConnectRes])

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
      <Button onClick={handleConnect}>Connect with {name}</Button>
    </>
  )
}

export function MyConnectionsClient(props: {
  // TODO: Figure out how to type this without duplication

  connector_name?: string
  initialData?: Promise<AppRouterOutput['listConnections']>
}) {
  const initialData = React.use(props.initialData ?? Promise.resolve(undefined))
  const trpc = useTRPC()
  const res = useSuspenseQuery(
    trpc.listConnections.queryOptions(
      {connector_name: props.connector_name},
      initialData ? {initialData} : undefined,
    ),
  )

  const definitions = useCommandDefinitionMap()
  return (
    <>
      <h1 className="text-3xl">My connections</h1>
      {res.data.items.map((conn) => (
        <div key={conn.id} className="p-4">
          <h2 className="text-2xl"> {conn.id}</h2>
          <CommandPopover
            hideGroupHeadings
            initialParams={{
              connection_id: conn.id,
            }}
            ctx={{}}
            definitions={definitions}
          />
        </div>
      ))}
    </>
  )
}

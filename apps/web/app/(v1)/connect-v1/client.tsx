'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type {ConnectorClient} from '@openint/cdk'
import {extractId} from '@openint/cdk'
import {Button} from '@openint/shadcn/ui'
import {useMutation, useSuspenseQuery} from '@openint/ui-v1/trpc'
import {R} from '@openint/util'
import {useTRPC} from '../console/(authenticated)/client'

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

export const Dummy = React.memo(function Dummy() {
  console.log('dummy rendering at least twice guaranteed')
  return 'Dummy'
})

export function AddConnection(props: {connectorConfigIds: Promise<string[]>}) {
  console.log('AddConnection rendering')
  const connectorConfigIds = R.uniq(React.use(props.connectorConfigIds))
  const ref = React.useRef<{[k: string]: {state: string}}>({})

  const [readyCcfgs, setReadyConnectors] = React.useState<string[]>([])
  const allReady = readyCcfgs.length === connectorConfigIds.length

  const cb = React.useCallback(
    (ctx: {state: string}, name: string) => {
      ref.current[name] = ctx
      setReadyConnectors((cs) => R.uniq([...cs, name]))
      if (Object.keys(ref.current).length === connectorConfigIds.length) {
        console.log('all ready', ref.current)
      }
    },
    [connectorConfigIds.length, ref, setReadyConnectors],
  )

  return (
    <>
      {connectorConfigIds.map((ccfgId) => (
        <div key={ccfgId} className="p-4">
          <h1 className="text-3xl">Add {ccfgId} connection</h1>
          <AddConnectionInner
            key={ccfgId}
            connectorConfigId={ccfgId}
            onReady={cb}
          />
        </div>
      ))}
      <hr />
      {allReady
        ? `${readyCcfgs.length} everything ready`
        : `${readyCcfgs.length} ${readyCcfgs.join(',')} ready`}
    </>
  )
}

function AddConnectionInner({
  connectorConfigId,
}: {
  connectorConfigId: string
  onReady: (ctx: {state: string}, name: string) => void
}) {
  const name = extractId(connectorConfigId as `ccfg_${string}`)[1]

  console.log('AddConnectionInner rendering', name)

  const ref = React.useRef<ConnectFn | undefined>(undefined)

  const trpc = useTRPC()
  // Should load script immediately (via useConnectHook) rather than waiting for suspense query?
  const preConnectRes = useSuspenseQuery(
    trpc.preConnect.queryOptions({
      id: connectorConfigId,
      data: {
        connector_name: name,
        input: {},
      },
      options: {},
    }),
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

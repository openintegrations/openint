'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type {ConnectorClient} from '@openint/cdk'
import {extractId} from '@openint/cdk'
import {Button} from '@openint/shadcn/ui'
import {R} from '@openint/util'

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
  onReady,
}: {
  connectorConfigId: string
  onReady: (ctx: {state: string}, name: string) => void
}) {
  const name = extractId(connectorConfigId as `ccfg_${string}`)[1]

  console.log('AddConnectionInner rendering', name)
  const ref = React.useRef<ConnectFn | undefined>(undefined)

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
      <Button
        onClick={() => {
          console.log('ref.current', ref.current)
        }}>
        Connect with {name}
      </Button>
    </>
  )
}

'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import {extractId} from '@openint/cdk'
import {Button} from '@openint/shadcn/ui'
import {R} from '@openint/util'

function wrapModule(options: {useConnectorLogic: () => [string, unknown]}) {
  return React.memo(function ModuleWrapper(props: {
    connector_name?: string
    onReady: (ctx: {state: string}) => void
  }) {
    console.log('ModuleWrapper rendering', props.connector_name)
    const [state] = options.useConnectorLogic()
    const {onReady} = props

    React.useEffect(() => {
      onReady({state})
    }, [onReady, state])
    return (
      <pre>
        {state}
        ---
        {JSON.stringify(props)}
      </pre>
    )
  })
}

const connectorImports = {
  plaid: () => import('@openint/connector-plaid/client'),
  greenhouse: () =>
    Promise.resolve({
      useConnectorLogic: () => React.useState('greenhouse'),
    }),
  finch: () => import('@openint/connector-finch/client'),
}

const ConnectorComponents = Object.fromEntries(
  Object.entries(connectorImports).map(([name, mod]) => [
    name,
    dynamic(
      () =>
        mod()
          .then((r) => {
            // Add a random delay for testing/development purposes
            const randomDelay = Math.floor(Math.random() * 2000) // Random delay up to 2000ms (2 seconds)
            return new Promise<typeof r>((resolve) => {
              setTimeout(() => {
                resolve(r)
              }, randomDelay)
            })
          })
          .then((m) => wrapModule(m)),
      {
        loading: () => <div>...Loading {name}...</div>,
      },
    ),
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
  const ref = React.useRef<{state: string} | undefined>(undefined)

  const [state, setState] = React.useState<{state: string} | undefined>(
    undefined,
  )

  const Component =
    ConnectorComponents[name as keyof typeof ConnectorComponents]
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
        onReady={React.useCallback(
          (c) => {
            ref.current = c
            onReady(c, name)
            setState(c)
          },
          [name, onReady],
        )}
      />
      <Button
        onClick={() => {
          console.log('ref.current', ref.current)
        }}>
        Connect with {name} {state?.state ? 'ready' : 'not ready'}
      </Button>
    </>
  )
}

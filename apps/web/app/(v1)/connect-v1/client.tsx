'use client'

import dynamic from 'next/dynamic'
import React from 'react'
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

export function AddConnection(props: {connector_names: Promise<string[]>}) {
  console.log('AddConnection rendering')
  const connector_names = R.uniq(React.use(props.connector_names))
  const ref = React.useRef<{[k: string]: {state: string}}>({})

  const [readyConnectors, setReadyConnectors] = React.useState<string[]>([])
  const allReady = readyConnectors.length === connector_names.length

  const cb = React.useCallback(
    (ctx: {state: string}, name: string) => {
      ref.current[name] = ctx
      setReadyConnectors((cs) => R.uniq([...cs, name]))
      if (Object.keys(ref.current).length === connector_names.length) {
        console.log('all ready', ref.current)
      }
    },
    [connector_names.length, ref, setReadyConnectors],
  )

  return (
    <>
      {connector_names.map((name) => (
        <AddConnectionInner key={name} connector_name={name} onReady={cb} />
      ))}
      <hr />
      <hr />
      <hr />
      {allReady
        ? `${readyConnectors.length} everything ready`
        : `${readyConnectors.length} ${readyConnectors.join(',')} ready`}
    </>
  )
}

function AddConnectionInner({
  connector_name: name,
  onReady,
}: {
  connector_name: string
  onReady: (ctx: {state: string}, name: string) => void
}) {
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
      <button onClick={() => console.log('ref.current', ref.current)}>
        Connect with {name} {state?.state ? 'ready' : 'not ready'}
      </button>
    </>
  )
}

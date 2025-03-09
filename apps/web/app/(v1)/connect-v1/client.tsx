'use client'

import dynamic from 'next/dynamic'
import React from 'react'

function wrapModule(options: {useConnectorLogic: () => [string, unknown]}) {
  return function ModuleWrapper(props: {
    connector_name?: string
    onReady: (ctx: {state: string}) => void
  }) {
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
  }
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

export function AddConnection(props: {connector_names: Promise<string[]>}) {
  const connector_names = React.use(props.connector_names)
  const ref = React.useRef<{[k: string]: {state: string}}>({})

  return (
    <>
      {connector_names.map((name) => (
        <AddConnectionInner
          key={name}
          connector_name={name}
          onReady={(ctx) => {
            ref.current[name] = ctx
            if (Object.keys(ref.current).length === connector_names.length) {
              console.log('all ready', ref.current)
            }
          }}
        />
      ))}
    </>
  )
}

function AddConnectionInner({
  connector_name: name,
  ...props
}: {
  connector_name: string
  onReady: (ctx: {state: string}) => void
}) {
  const ref = React.useRef<{state: string} | undefined>(undefined)

  // const [state, setState] = React.useState<{state: string} | undefined>(
  //   undefined,
  // )

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
        onReady={(c) => {
          ref.current = c
          props.onReady(c)
          // setState(c)
        }}
      />
      <button onClick={() => console.log('ref.current', ref.current)}>
        Connect with {name}
      </button>
    </>
  )
}

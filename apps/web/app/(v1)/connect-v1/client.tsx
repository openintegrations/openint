'use client'

import dynamic from 'next/dynamic'
import React, {Suspense} from 'react'

function wrapModule(options: {useConnectorLogic: () => [string, unknown]}) {
  return function ModuleWrapper(props: {connector_name?: string}) {
    const [state] = options.useConnectorLogic()
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
  return (
    <Suspense>
      <AddConnectionInner connector_names={connector_names} />
    </Suspense>
  )
}

function AddConnectionInner(props: {connector_names: string[]}) {
  return (
    <>
      {props.connector_names.map((name) => {
        const Component =
          ConnectorComponents[name as keyof typeof ConnectorComponents]
        if (!Component) {
          throw new Error(`Unknown connector: ${name}`)
        }
        return <Component key={name} connector_name={name} />
      })}
    </>
  )
}

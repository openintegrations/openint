'use client'

import dynamic from 'next/dynamic'
import React, {Suspense} from 'react'

// const useStuff = dynamic(() => import('@openint/connector-plaid/client'), {})

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
    dynamic(() => mod().then((m) => wrapModule(m))),
  ]),
)

export function AddConnection(props: {connector_names: string[]}) {
  return (
    <Suspense>
      <AddConnectionInner connector_names={props.connector_names} />
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

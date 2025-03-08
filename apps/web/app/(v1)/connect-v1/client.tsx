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
  plaid: dynamic(() =>
    import('@openint/connector-plaid/client').then((m) => wrapModule(m)),
  ),
  greenhouse: dynamic(() =>
    Promise.resolve({
      useConnectorLogic: () => React.useState('greenhouse'),
    }).then((m) => wrapModule(m)),
  ),
  finch: dynamic(() =>
    import('@openint/connector-finch/client').then((m) => wrapModule(m)),
  ),
}

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
          connectorImports[name as keyof typeof connectorImports]
        if (!Component) {
          throw new Error(`Unknown connector: ${name}`)
        }
        return <Component key={name} connector_name={name} />
      })}
    </>
  )
}

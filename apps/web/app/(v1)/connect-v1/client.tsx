'use client'

import dynamic from 'next/dynamic'
import React, {Suspense} from 'react'

// const useStuff = dynamic(() => import('@openint/connector-plaid/client'), {})

export function AddConnection(props: {connector_names: string[]}) {
  return (
    <Suspense>
      <AddConnectionInner connector_names={props.connector_names} />
    </Suspense>
  )
}

function AddConnectionInner(props: {connector_names: string[]}) {
  const plaid = React.use(import('@openint/connector-plaid/client'))

  console.log('plaid', plaid.plaidClientConnector.useConnectHook)

  // React.useEffect(() => {
  //   const plaid = import('@openint/connector-plaid/client')

  // }, [])
  return null
  // Dynamic import?
}

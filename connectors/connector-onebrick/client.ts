import type {ConnectorClient} from '@openint/cdk'
import type {helpers, onebrickSchemas} from './def'

import React from 'react'
import {Deferred} from '@openint/util/promise-utils'

export const onebrickClientConector = {
  useConnectHook: (_) => {
    const [options, setOptions] = React.useState<
      (typeof helpers)['_types']['connect_input']
    >({publicToken: undefined, redirect_url: undefined})
    const [deferred] = React.useState(
      new Deferred<(typeof helpers)['_types']['connect_output']>(),
    )
    React.useEffect(() => {
      if (options.publicToken && options.redirect_url) {
        window.open(
          `https://cdn.onebrick.io/sandbox-widget/?accessToken=${options.publicToken}&redirect_url=${options.redirect_url}/api/webhook/onebrick`,
          'popup',
        )
      }
    }, [options])
    return (opts) => {
      setOptions({
        publicToken: opts.publicToken,
        redirect_url: opts.redirect_url,
      })
      return deferred.promise
    }
  },
} satisfies ConnectorClient<typeof onebrickSchemas>

export default onebrickClientConector

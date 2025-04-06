'use client'

import React from 'react'
import {Button} from '@openint/shadcn/ui'

export function ConnectCallbackClient({
  data,
  debug = true,
}: {
  data: unknown
  debug?: boolean
}) {
  React.useEffect(() => {
    const opener = window.opener as Window | null
    if (opener && !debug) {
      opener.postMessage(data, '*')
      // window.close()
    }
  }, [data, debug])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-sm">
        Completing authentication...
      </p>
      {!debug && (
        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <pre className="text-muted-foreground max-w-full overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            const opener = window.opener as Window | null
            if (opener) {
              // TODO: refactor the data format
              opener.postMessage(data, '*')
              window.close()
            }
          }}>
          Complete Authentication
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            const opener = window.opener as Window | null
            if (opener) {
              opener.postMessage(
                {success: false, error: 'Authentication failed'},
                '*',
              )
              window.close()
            }
          }}>
          Simulate Error
        </Button>
      </div>
    </div>
  )
}

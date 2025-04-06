'use client'

import React from 'react'

export function ConnectCallbackClient({data}: {data: unknown}) {
  React.useEffect(() => {
    const opener = window.opener as Window | null
    if (opener) {
      opener.postMessage(data, '*')
      // window.close()
    }
  }, [data])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <p className="text-muted-foreground text-sm">
        Completing authentication...
      </p>
      <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <pre className="text-muted-foreground max-w-full overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

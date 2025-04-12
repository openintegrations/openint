import React, {Suspense} from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {Spinner} from '@openint/ui-v1'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthProvider dynamic>{props.children}</AuthProvider>
    </Suspense>
  )
}

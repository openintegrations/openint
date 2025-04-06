import React, {Suspense} from 'react'
import {Spinner} from '@openint/ui-v1'
import {AuthProvider} from '@openint/console-auth/client'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthProvider dynamic>{props.children}</AuthProvider>
    </Suspense>
  )
}

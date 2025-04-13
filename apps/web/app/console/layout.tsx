import React, {Suspense} from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {Spinner} from '@openint/ui-v1'
import {ClientApp} from '@/lib-client/ClientApp'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthProvider dynamic>
        <ClientApp>{props.children}</ClientApp>
      </AuthProvider>
    </Suspense>
  )
}

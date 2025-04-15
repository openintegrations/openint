import React, {Suspense} from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {Spinner} from '@openint/ui-v1'
import {TRPCApp} from '@/lib-client/TRPCApp'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthProvider dynamic>
        <TRPCApp>{props.children}</TRPCApp>
      </AuthProvider>
    </Suspense>
  )
}

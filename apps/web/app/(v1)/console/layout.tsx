import React, {Suspense} from 'react'
import {LoadingSpinner} from '@openint/engine-frontend'
import {AuthProvider} from '@/lib-client/auth.client'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProvider dynamic>{props.children}</AuthProvider>
    </Suspense>
  )
}

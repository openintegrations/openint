import React, {Suspense} from 'react'
import {LoadingSpinner} from '@openint/ui-v1/components/LoadingSpinner'
import {AuthProvider} from '@/lib-client/auth.client'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProvider dynamic>{props.children}</AuthProvider>
    </Suspense>
  )
}

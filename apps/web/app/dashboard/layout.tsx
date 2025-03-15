import '@openint/ui-v1/global.css'
import {ClerkProvider} from '@clerk/nextjs'
// import {TRPCProvider} from '@openint/engine-frontend'
import React, {Suspense} from 'react'
import {LoadingSpinner} from '@openint/engine-frontend'
import {ClientRootWithClerk} from '@/components/ClientRoot'

export default function AdminLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClerkProvider dynamic>
        <ClientRootWithClerk>{props.children}</ClientRootWithClerk>
      </ClerkProvider>
    </Suspense>
  )
}

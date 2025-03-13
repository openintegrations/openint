import '@openint/ui-v1/global.css'
import {ClerkProvider} from '@clerk/nextjs'
// import {TRPCProvider} from '@openint/engine-frontend'
import React, {Suspense} from 'react'
import {Spinner} from '@openint/open-file-picker/src/components/Spinner'
import {ClientRootWithClerk} from '@/components/ClientRoot'

export default function AdminLayout(props: {children: React.ReactNode}) {
  return (
    <Suspense fallback={<Spinner />}>
      <ClerkProvider dynamic>
        <ClientRootWithClerk>{props.children}</ClientRootWithClerk>
      </ClerkProvider>
    </Suspense>
  )
}

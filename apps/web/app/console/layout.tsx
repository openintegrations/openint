import type {Metadata} from 'next'

import {cookies} from 'next/headers'
import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {isProduction} from '@openint/env'
import {TRPCApp} from '@/lib-client/TRPCApp'
import {resolveLinkPath} from '@/lib-common/Link'

// TODO: react.cache currentViewer function

export const metadata: Metadata = {
  title: 'OpenInt Console',
  description: 'OpenInt management console',
  icons: {
    icon: '/_assets/logo-favicon.svg',
    apple: '/_assets/logo-favicon.svg',
  },
}

export default async function ConsoleLayout(props: {
  children: React.ReactNode
}) {
  const cookie = await cookies()
  return (
    <AuthProvider
      dynamic
      signUpUrl={resolveLinkPath('/console/sign-up/')}
      signInUrl={resolveLinkPath('/console/sign-in/')}
      afterSignOutUrl={resolveLinkPath('/console/sign-in/')}
      touchSession={isProduction}>
      <TRPCApp
        // needed for SSR of client components, which otherwise would not have
        // ability to make authenticated requests to the API route
        // SSR unlike server components does not have access to the TRPC router
        // to make in-process authenticated requests
        // SSR still make requests for situations where data is not pre-fetched
        cookie={cookie.toString()}
        // This does not currently work... See TRPCApp.tsx for more details
        reactQueryNextExperimental={false}>
        {props.children}
      </TRPCApp>
    </AuthProvider>
  )
}

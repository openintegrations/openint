import {cookies} from 'next/headers'
import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {getBaseURLs, isProduction} from '@openint/env'
import {TRPCApp} from '@/lib-client/TRPCApp'

// TODO: react.cache currentViewer function

export default async function ConsoleLayout(props: {
  children: React.ReactNode
}) {
  const cookie = await cookies()
  return (
    <AuthProvider
      dynamic
      signUpUrl={getBaseURLs(null).console + '/sign-up'}
      signInUrl={getBaseURLs(null).console + '/sign-in'}
      afterSignOutUrl={getBaseURLs(null).console + '/sign-in'}
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

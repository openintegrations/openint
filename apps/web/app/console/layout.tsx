import {cookies} from 'next/headers'
import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {TRPCApp} from '@/lib-client/TRPCApp'

// TODO: react.cache currentViewer function

// This does not currently work... See TRPCApp.tsx for more details
const enableReactQueryStreamedHydration = false

export default async function ConsoleLayout(props: {
  children: React.ReactNode
}) {
  const additionalProps = enableReactQueryStreamedHydration
    ? // Pass cookie to the TRPCApp for any authenticated requests to the API route
      // Though we aren't actually making requests server side at all
      // when not using ReactQueryStreamedHydration
      {reactQueryNextExperimental: true, cookie: (await cookies()).toString()}
    : {}

  return (
    <AuthProvider dynamic>
      <TRPCApp {...additionalProps}>{props.children}</TRPCApp>
    </AuthProvider>
  )
}

import {cookies} from 'next/headers'
import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {TRPCApp} from '@/lib-client/TRPCApp'

// TODO: react.cache currentViewer function

export default async function ConsoleLayout(props: {
  children: React.ReactNode
}) {
  // Pass cookie to the TRPCApp for any authenticated requests to the API route
  const cookie = await cookies()
  return (
    <AuthProvider dynamic>
      <TRPCApp reactQueryNextExperimental cookie={cookie.toString()}>
        {props.children}
      </TRPCApp>
    </AuthProvider>
  )
}

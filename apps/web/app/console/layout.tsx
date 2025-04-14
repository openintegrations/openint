import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {TRPCApp} from '@/lib-client/TRPCApp'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return (
    <AuthProvider dynamic>
      <TRPCApp>{props.children}</TRPCApp>
    </AuthProvider>
  )
}

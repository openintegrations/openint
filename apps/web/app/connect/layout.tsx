import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'

export default function ConnectLayout(props: {children: React.ReactNode}) {
  return <AuthProvider>{props.children}</AuthProvider>
}

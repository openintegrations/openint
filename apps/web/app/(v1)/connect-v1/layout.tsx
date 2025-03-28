import React from 'react'
import {AuthProvider} from '@/lib-client/auth.client'

export default function ConnectLayout(props: {children: React.ReactNode}) {
  return <AuthProvider>{props.children}</AuthProvider>
}

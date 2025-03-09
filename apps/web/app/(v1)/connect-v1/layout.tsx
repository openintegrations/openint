import React from 'react'
import {AuthProvider} from '@/lib-server/auth.client'

export default function ConsoleLayout(props: {children: React.ReactNode}) {
  return <AuthProvider>{props.children}</AuthProvider>
}

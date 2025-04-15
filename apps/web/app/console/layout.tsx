import React from 'react'
import {AuthProvider} from '@openint/console-auth/client'
import {TRPCApp} from '@/lib-client/TRPCApp'
import {currentViewer} from '@/lib-server/auth.server'
import {jwt} from '@/lib-server/globals'

// TODO: react.cache currentViewer function

export default async function ConsoleLayout(props: {
  children: React.ReactNode
}) {
  const {viewer} = await currentViewer()
  // Temporarly to get the @tanstack/react-query-next-experimental working
  // due to the fact that we need to call server side api to get the token
  // instead we should probably pass cookie header down so that it can be used
  // server side when making request to the api route
  const token = await jwt.signToken(viewer)

  return (
    <AuthProvider dynamic>
      <TRPCApp reactQueryNextExperimental token={token}>
        {props.children}
      </TRPCApp>
    </AuthProvider>
  )
}

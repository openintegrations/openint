'use client'

import '@openint/ui-v1/global.css'
import {_trpcReact} from '@openint/engine-frontend'
import 'next/image'
import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {TRPCProvider} from '@openint/engine-frontend'
import {createQueryClient} from '@/lib-client/react-query-client'

function DebugInner() {
  const res = _trpcReact.listConnectorMetas.useQuery({})
  return (
    <div className="flex h-screen w-screen flex-col bg-red-500 p-10">
      <pre>{JSON.stringify(res.data, null, 2)}</pre>
    </div>
  )
}

export default function Debug() {
  const {current: queryClient} = React.useRef(createQueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient}>
        <DebugInner />
        hello
      </TRPCProvider>
    </QueryClientProvider>
  )
}

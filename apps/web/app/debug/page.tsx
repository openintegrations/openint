'use client'

// eslint-disable-next-line import/no-unresolved
import '@openint/ui-v1/dist/tailwind.css'
import {_trpcReact} from '@openint/engine-frontend'
import 'next/image'
// tailwind.css file will be built separately
import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {TRPCProvider} from '@openint/engine-frontend'
import {createQueryClient} from '@/lib-client/react-query-client'

function DebugInner() {
  const res = _trpcReact.listConnectorMetas.useQuery({})
  return (
    <div className="flex h-screen w-screen flex-col p-10">
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

'use client'

import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query'
import React from 'react'
import {delay} from '@openint/util/promise-utils'

const fetchDummyData = async (input: string) => {
  await delay(3000)
  return {message: `dummy response ${input}`}
}

function DebugClientPage() {
  const [input, setInput] = React.useState('')
  const query = useSuspenseQuery({
    queryKey: ['dummyData', input],
    queryFn: () => fetchDummyData(input),
  })

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Client Debug Page</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="rounded border border-gray-300 px-4 py-2"
        placeholder="Enter text..."
      />
      <p className="text-gray-600">Query result: {query.data.message}</p>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: false,
    },
  },
})

export default function DebugClientPageWithProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <DebugClientPage />
    </QueryClientProvider>
  )
}

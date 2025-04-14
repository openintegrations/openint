'use client'

import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {ErrorBoundary} from 'next/dist/client/components/error-boundary'
import React, {Suspense} from 'react'
import {delay} from '@openint/util/promise-utils'

const fetchDummyData = async (input: string) => {
  await delay(3000)
  throw new Error('Something went wrong')
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
      {/* Should we use suspense boundary with pre and post connect? */}
      <ErrorBoundary errorComponent={ErrorComponent}>
        <Suspense fallback={<div>Running query...</div>}>
          <DebugClientPage />
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

const ErrorComponent = () => {
  return <div>Something went wrong but got caught by us...</div>
}

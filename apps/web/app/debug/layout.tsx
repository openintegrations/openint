import {Suspense} from 'react'
import {delay} from '@openint/util/promise-utils'
import DebugPage from './page'

export default async function DebugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('Starting layout delay...', new Date().toISOString())
  const startTime = Date.now()
  await delay(3000)
  const endTime = Date.now()
  console.log(`Layout delay complete after ${endTime - startTime}ms`)

  return (
    <div className="min-h-screen bg-blue-300">
      <div className="p-8">{children}</div>
      <div className="p-8">
        Separately rendered async content
        <Suspense>
          <DebugPage />
        </Suspense>
      </div>
    </div>
  )
}

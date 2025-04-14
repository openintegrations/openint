import {delay} from '@openint/util/promise-utils'

export default async function DebugPage() {
  console.log('Starting page delay...', new Date().toISOString())
  const startTime = Date.now()
  await delay(5000)
  const endTime = Date.now()
  console.log(`Page delay complete after ${endTime - startTime}ms`)

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Debug Page</h1>
      <p className="text-gray-600">This page took 5 seconds to load</p>
    </div>
  )
}

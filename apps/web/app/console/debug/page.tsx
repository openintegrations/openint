import {currentViewer} from '@/lib-server/auth.server'

export default async function DebugPage() {
  const {viewer} = await currentViewer()

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Debug</h1>

      <div className="bg-muted rounded-lg p-4">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify({viewer}, null, 2)}
        </pre>
      </div>
    </div>
  )
}

import {currentViewer} from '@/lib-server/auth.server'

export default async function ConsolePage() {
  const {viewer} = await currentViewer()

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Console</h1>

      <div className="bg-muted rounded-lg p-4">
        <pre className="whitespace-pre-wrap break-words">
          {JSON.stringify({viewer}, null, 2)}
        </pre>
      </div>

      {/* TODO: Add dashboard metrics */}
      {/* TODO: Add recent activity feed */}
      {/* TODO: Add quick actions */}
    </div>
  )
}

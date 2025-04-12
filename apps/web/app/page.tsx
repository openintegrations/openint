import type {PageProps} from '@/lib-common/next-utils'

import {Link} from '@/lib-common/Link'
import {currentViewer} from '@/lib-server/auth.server'

export default function Page(pageProps: PageProps) {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">OpenInt</h1>
      <Link
        href="/connect"
        className="text-blue-500 underline hover:text-blue-700">
        Connect
      </Link>
      <Link
        href="/console"
        className="text-blue-500 underline hover:text-blue-700">
        Console
      </Link>
      <Link
        href="/api/v1"
        className="text-blue-500 underline hover:text-blue-700">
        API
      </Link>
      <CurrentViewerDebug {...pageProps} />
    </div>
  )
}

export async function CurrentViewerDebug(pageProps: PageProps) {
  const viewer = await currentViewer(pageProps)
  return (
    <pre className="w-lg max-h-[80vh] max-w-[80vw] overflow-auto rounded-lg bg-gray-100 p-4 font-mono text-sm shadow-inner">
      {JSON.stringify(viewer, null, 2)}
    </pre>
  )
}

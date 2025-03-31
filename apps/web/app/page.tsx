import Link from 'next/link'

export default function Page() {
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
    </div>
  )
}

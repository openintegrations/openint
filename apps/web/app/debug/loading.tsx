export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900" />
      <p className="text-lg text-gray-600">Loading...</p>
    </div>
  )
}

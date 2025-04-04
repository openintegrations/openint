import {Loader2} from 'lucide-react'

export function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="text-button size-7 animate-spin" />
    </div>
  )
}

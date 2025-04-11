import {cn} from '@openint/shadcn/lib/utils'

export function FullScreenCenter(props: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex h-screen w-screen flex-col items-center justify-center',
        props.className,
      )}>
      {props.children}
    </div>
  )
}

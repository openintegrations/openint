import {cn} from '@openint/shadcn/lib/utils'

export type StatusType = 'healthy' | 'warning' | 'offline' | 'destructive'

const statusColorMap: Record<StatusType, string> = {
  healthy: 'bg-green-500 border-green-600',
  warning: 'bg-yellow-400 border-yellow-500',
  offline: 'bg-gray-300 border-gray-400',
  destructive: 'bg-red-500 border-red-600',
}

interface StatusDotProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The status to display
   */
  status: StatusType
  /**
   * Optional className for styling
   */
  className?: string
}

export function StatusDot({status, className, ...props}: StatusDotProps) {
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full border-[1.5px]',
        statusColorMap[status],
        className,
      )}
      {...props}
    />
  )
}

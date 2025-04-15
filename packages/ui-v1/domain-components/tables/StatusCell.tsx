import type {StatusType} from '../../components/StatusDot'

import {cn} from '@openint/shadcn/lib/utils'

interface StatusCellProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The status type to display
   */
  status: StatusType
  /**
   * Optional className for styling
   */
  className?: string
}

export function StatusCell({status, className, ...props}: StatusCellProps) {
  // Map status to display text - matching the image exactly
  const statusTextMap: Record<StatusType, string> = {
    healthy: 'Healthy',
    warning: 'Warning',
    offline: 'Offline',
    destructive: 'Error',
  }

  // Map status to background and text colors - pastel backgrounds with contrasting text
  const statusBgMap: Record<StatusType, string> = {
    healthy: 'bg-[#BBFAC5] text-[#387043]',
    warning: 'bg-[#FFF0A0] text-[#756628]',
    offline: 'bg-gray-200 text-gray-600',
    destructive: 'bg-[#F5B8B8] text-[#923535]',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded px-3 py-1 text-sm font-medium',
        statusBgMap[status],
        className,
      )}
      {...props}>
      {statusTextMap[status]}
    </div>
  )
}

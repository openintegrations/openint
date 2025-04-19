import type {ConnectionExpanded} from '@openint/api-v1/models'

import {AlertCircle, CheckCircle2, HelpCircle, XCircle} from 'lucide-react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui'

export interface ConnectionStatusBadgeProps {
  status: ConnectionExpanded['status']
  className?: string
}

export function ConnectionStatusBadge({
  status,
  className,
}: ConnectionStatusBadgeProps) {
  const {icon: StatusIcon, label, color} = getConnectionStatusStyles(status)

  return (
    <Badge variant="secondary" className={cn('mt-2 gap-1', color, className)}>
      <StatusIcon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </Badge>
  )
}

export const getConnectionStatusStyles = (
  status: ConnectionExpanded['status'],
) => {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        label: 'Connected',
        color: 'bg-green-100 text-green-800 hover:bg-green-100/80',
        borderColor: 'border-green-200',
      }
    case 'error':
      return {
        icon: AlertCircle,
        label: 'Error',
        color: 'bg-red-100 text-red-800 hover:bg-red-100/80',
        borderColor: 'border-red-200',
      }
    case 'disconnected':
      return {
        icon: XCircle,
        label: 'Disconnected',
        color: 'bg-amber-100 text-amber-800 hover:bg-amber-100/80',
        borderColor: 'border-amber-200',
      }
    case 'manual':
    default:
      return {
        icon: HelpCircle,
        label: 'Manual',
        color: 'bg-gray-100 text-gray-800 hover:bg-gray-100/80',
        borderColor: 'border-gray-200',
      }
  }
}

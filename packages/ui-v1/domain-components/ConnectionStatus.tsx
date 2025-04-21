import type {ConnectionExpanded} from '@openint/api-v1/models'

import {AlertCircle, CheckCircle2, HelpCircle, XCircle} from 'lucide-react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge, Button} from '@openint/shadcn/ui'

export interface ConnectionStatusBadgeProps {
  status: ConnectionExpanded['status']
  className?: string
}

// Define the return type for getConnectionStatusStyles
interface ConnectionStatusStyle {
  icon: React.ComponentType<{className?: string}>
  label: string
  color: string
  borderColor: string
  pillColor: string
  message: string
}

// Define the getConnectionStatusStyles function before it's used
export const getConnectionStatusStyles = (
  status: ConnectionExpanded['status'],
): ConnectionStatusStyle => {
  switch (status) {
    case 'healthy':
      return {
        icon: CheckCircle2,
        label: 'Connected',
        color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80',
        pillColor: 'bg-emerald-500',
        borderColor: 'border-emerald-200',
        message: 'Your integration is healthy and ready to use.',
      }
    case 'error':
      return {
        icon: AlertCircle,
        label: 'Error',
        color: 'bg-rose-50 text-rose-700 hover:bg-rose-50/80',
        pillColor: 'bg-rose-500',
        borderColor: 'border-rose-200',
        message:
          'Your integration is experiencing an error. Please delete and connect it again.',
      }
    case 'disconnected':
      return {
        icon: XCircle,
        label: 'Disconnected',
        color: 'bg-amber-50 text-amber-700 hover:bg-amber-50/80',
        pillColor: 'bg-amber-500',
        borderColor: 'border-amber-200',
        message:
          'Your integration has disconnected. Please validate your connection and if need be delete and connect it again.',
      }
    case 'manual':
      return {
        icon: HelpCircle,
        label: 'Manual',
        color: 'bg-slate-50 text-slate-700 hover:bg-slate-50/80',
        pillColor: 'bg-slate-500',
        borderColor: 'border-slate-200',
        message:
          'Your integration was manually imported so we cannot verify its status. Please validate your connection and if need be delete and connect it again.',
      }
    case 'unknown':
    default:
      return {
        icon: HelpCircle,
        label: 'Status Unknown',
        color: 'bg-slate-50 text-slate-700 hover:bg-slate-50/80',
        pillColor: 'bg-slate-500',
        borderColor: 'border-slate-200',
        message:
          'Your integration status is unknown. This usually resolves on its own but feel free to manually validate your connection.',
      }
  }
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

export function ConnectionStatusPill({
  status,
  className,
  onClick,
}: {
  status: ConnectionExpanded['status']
  className?: string
  onClick?: () => void
}) {
  const {
    icon: StatusIcon,
    label,
    pillColor,
    message,
  } = getConnectionStatusStyles(status)

  return (
    <div className={cn('group relative inline-flex', className)}>
      <div className={cn('flex items-center gap-1')}>
        <div className={cn('h-2 w-2 rounded-full', pillColor)} />
        {status !== 'disconnected' ? (
          <div className="text-xs text-gray-500">{label}</div>
        ) : (
          <Button variant="ghost" onClick={onClick}>
            Reconnect
          </Button>
        )}
      </div>
      <div className="absolute left-0 top-full z-10 mt-1 hidden min-w-[200px] rounded-md bg-white p-3 text-xs shadow-md group-hover:block">
        <StatusIcon className="mb-2 h-4 w-4" />
        {message}
      </div>
    </div>
  )
}

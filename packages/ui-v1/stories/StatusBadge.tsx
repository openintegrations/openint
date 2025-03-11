import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui/badge'

export type StatusBadgeVariant =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'default'

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusBadgeVariant
  text?: string
}

export function StatusBadge({
  status,
  text,
  className,
  ...props
}: StatusBadgeProps) {
  const statusConfig: Record<
    StatusBadgeVariant,
    {label: string; className: string}
  > = {
    success: {
      label: text || 'Success',
      className:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    error: {
      label: text || 'Error',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    warning: {
      label: text || 'Warning',
      className:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    info: {
      label: text || 'Info',
      className:
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    default: {
      label: text || 'Default',
      className:
        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    },
  }

  const {label, className: statusClassName} = statusConfig[status]

  return (
    <div className="bg-pink-500 w-[332px] p-5">

      <Badge
        className={cn('font-medium', statusClassName, className)}
        {...props}>
        {label}
      </Badge>
    </div>
  )
}

export default StatusBadge

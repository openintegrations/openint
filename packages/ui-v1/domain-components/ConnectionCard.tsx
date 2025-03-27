import React from 'react'
import {cn} from '@openint/shadcn/lib/utils'
import {Badge} from '@openint/shadcn/ui'

export interface ConnectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  connection: {
    id: string
    displayName?: string | null
    status?: 'healthy' | 'disconnected' | 'error' | 'manual' | null
    statusMessage?: string | null
    labels?: string[]
  }
}

/**
 * ConnectionCard component displays connection information with status and labels.
 * It uses the Badge component from shadcn/ui.
 *
 * The component is responsive and will adapt to different screen sizes.
 * It includes a hover effect with darker border and background to indicate it's clickable.
 */
const ConnectionCard = ({
  className,
  connection,
  ...props
}: ConnectionCardProps) => {
  const {displayName, status, statusMessage, labels} = connection

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'disconnected':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'manual':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <div
      className={cn(
        'group flex w-full max-w-md cursor-pointer items-center gap-6 rounded-lg border border-gray-200 p-6 transition-all hover:border-gray-400 hover:bg-gray-50 md:max-w-lg',
        className,
      )}
      {...props}>
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold transition-colors group-hover:text-gray-900">
          {displayName || 'Unnamed Connection'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {status && (
            <Badge variant="secondary" className={getStatusColor(status)}>
              {status.toUpperCase()}
            </Badge>
          )}
          {labels?.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              {label}
            </Badge>
          ))}
        </div>
        {statusMessage && (
          <p className="text-sm text-gray-600">{statusMessage}</p>
        )}
      </div>
    </div>
  )
}

ConnectionCard.displayName = 'ConnectionCard'

export {ConnectionCard}
